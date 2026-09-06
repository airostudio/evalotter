/**
 * Emits idempotent .sql equivalent to `npm run seed`, for environments that
 * cannot reach the Supabase host over the network (paste into the Supabase
 * SQL editor instead).
 *
 * Usage:
 *   npx tsx scripts/seed/generate-sql.ts supabase/seed_data.sql        # one file
 *   npx tsx scripts/seed/generate-sql.ts supabase/seed_data.sql 5      # 5 parts
 *
 * Split output is written as <name>.partNofM.sql and MUST be run in order:
 * categories first, then every question, and only then the assessments —
 * because assessment_questions resolves questions by external_key, and the
 * flagship profile reuses questions owned by other assessments. Each part is
 * its own transaction, so a part either fully applies or not at all.
 *
 * Mirrors scripts/seed/run.ts exactly:
 *  - categories, questions, assessments and scoring dimensions are upserted
 *    on their stable keys (never duplicated)
 *  - options, result ranges and brain-profile rules are deleted and
 *    re-inserted
 *  - every run publishes a NEW assessment_version rather than mutating a
 *    published one, then repoints assessments.current_version_id at it
 * Re-running is safe and produces the same end state.
 */
import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";

const CATEGORY_LABELS: Record<string, { label: string; icon: string; order: number }> = {
  cognitive: { label: "Cognitive", icon: "brain", order: 1 },
  logical: { label: "Logical", icon: "git-branch", order: 2 },
  memory: { label: "Memory", icon: "sparkles", order: 3 },
  numerical: { label: "Numerical", icon: "calculator", order: 4 },
  language: { label: "Language", icon: "message-square", order: 5 },
  emotional: { label: "Emotional", icon: "heart-handshake", order: 6 },
  spatial: { label: "Spatial", icon: "box", order: 7 },
  creative: { label: "Creative", icon: "palette", order: 8 },
  "self-discovery": { label: "Self Discovery", icon: "hand", order: 9 },
  "ai-analysis": { label: "AI Analysis", icon: "sparkles", order: 10 },
};

const DEFAULT_SETTINGS = {
  allowBackNavigation: true,
  randomizeSections: false,
  randomizeQuestions: false,
  randomizeAnswerOrder: false,
  showProgressBar: true,
  showInstructionsBetweenSections: true,
  autosaveIntervalSeconds: 10,
  totalTimeLimitSeconds: null,
};

/** Single-quoted SQL string literal, or NULL. */
function s(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  return `'${String(v).replace(/'/g, "''")}'`;
}
/** Numeric/boolean literal, or NULL. */
function n(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  return String(v);
}
/** jsonb literal, or NULL. */
function j(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  return `${s(JSON.stringify(v))}::jsonb`;
}
/** text[] literal. */
function arr(v: unknown): string {
  const items = Array.isArray(v) ? v : [];
  if (items.length === 0) return `'{}'::text[]`;
  return `ARRAY[${items.map((x) => s(x)).join(", ")}]::text[]`;
}

function main() {
  const out = process.argv[2] ?? "supabase/seed_data.sql";
  const dataDir = join(__dirname, "data");
  const files = readdirSync(dataDir).filter((f) => f.endsWith(".json")).sort();
  const seeds = files.flatMap((f) => {
    const parsed = JSON.parse(readFileSync(join(dataDir, f), "utf8"));
    const entries = Array.isArray(parsed) ? parsed : [parsed];
    return entries.map((data: any) => ({ file: f, data }));
  });

  // Each "unit" is a self-contained group of statements. Units are emitted in
  // dependency order and never split internally, so any contiguous run of
  // them is a valid transaction.
  const units: { label: string; sql: string }[] = [];
  let L: string[] = [];
  const flush = (label: string) => {
    if (L.length > 0) units.push({ label, sql: L.join("\n") });
    L = [];
  };

  // ---- Categories ---------------------------------------------------------
  const usedCategoryKeys = [...new Set(seeds.map((s2) => s2.data.categoryKey))];
  L.push("-- Categories");
  for (const key of usedCategoryKeys) {
    const meta = CATEGORY_LABELS[key as string];
    if (!meta) throw new Error(`No label metadata for category "${key}"`);
    L.push(
      `insert into assessment_categories (key, label, icon, "order") values (${s(key)}, ${s(meta.label)}, ${s(meta.icon)}, ${meta.order})\n` +
        `  on conflict (key) do update set label = excluded.label, icon = excluded.icon, "order" = excluded."order";`
    );
  }
  flush("categories");

  // ---- Pass 1: questions + options ---------------------------------------
  // Every question must exist before ANY assessment links them: the flagship
  // profile reuses questions owned by other assessments.
  for (const { data } of seeds) {
    for (const q of data.questions ?? []) {
      L.push(
        `insert into questions (external_key, question_type, question_text, instructions, media, correct_answer, score_config, difficulty, category, tags, time_limit_seconds, required) values (` +
          [
            s(q.key),
            `${s(q.questionType)}::question_type`,
            s(q.questionText),
            s(q.instructions ?? null),
            j(q.media ?? []),
            j(q.correctAnswer ?? null),
            j(q.scoreConfig ?? []),
            q.difficulty ? `${s(q.difficulty)}::assessment_difficulty` : "NULL",
            s(data.slug),
            arr(q.tags ?? []),
            n(q.timeLimitSeconds ?? null),
            q.required === false ? "false" : "true",
          ].join(", ") +
          `)\n  on conflict (external_key) do update set question_type = excluded.question_type, question_text = excluded.question_text, instructions = excluded.instructions, media = excluded.media, correct_answer = excluded.correct_answer, score_config = excluded.score_config, difficulty = excluded.difficulty, category = excluded.category, tags = excluded.tags, time_limit_seconds = excluded.time_limit_seconds, required = excluded.required;`
      );
      L.push(
        `delete from question_options where question_id = (select id from questions where external_key = ${s(q.key)});`
      );
      const opts = q.options ?? [];
      if (opts.length > 0) {
        const rows = opts.map(
          (opt: any, i: number) =>
            `((select id from questions where external_key = ${s(q.key)}), ${s(opt.label)}, ${s(opt.value)}, ${s(opt.imageUrl ?? null)}, ${opt.isCorrect === undefined || opt.isCorrect === null ? "NULL" : String(opt.isCorrect)}, ${i}, ${j(opt.scoreConfig ?? [])})`
        );
        L.push(
          `insert into question_options (question_id, label, value, image_url, is_correct, "order", score_config) values\n  ${rows.join(",\n  ")};`
        );
      }
      flush(`question ${q.key}`);
    }
  }

  // ---- Pass 2: assessments and everything hanging off them ---------------
  for (const { file, data } of seeds) {
    const totalQuestionCount = (data.questions?.length ?? 0) + (data.reuseQuestionKeys?.length ?? 0);
    L.push(`-- ${data.slug} (${file})`);
    L.push("do $$");
    L.push("declare");
    L.push("  v_cat uuid; v_ass uuid; v_ver uuid; v_num integer;");
    L.push("begin");
    L.push(`  select id into strict v_cat from assessment_categories where key = ${s(data.categoryKey)};`);
    L.push(
      `  insert into assessments (slug, title, short_description, long_description, icon, category_id, engine_type, difficulty, estimated_duration_minutes, question_count, featured, access, status) values (` +
        [
          s(data.slug),
          s(data.title),
          s(data.shortDescription),
          s(data.longDescription ?? ""),
          s(data.icon),
          "v_cat",
          `${s(data.engineType)}::assessment_engine_type`,
          `${s(data.difficulty)}::assessment_difficulty`,
          n(data.estimatedDurationMinutes),
          n(totalQuestionCount),
          data.featured ? "true" : "false",
          `${s(data.access)}::assessment_access`,
          `${s(data.status ?? "published")}::assessment_status`,
        ].join(", ") +
        `)\n    on conflict (slug) do update set title = excluded.title, short_description = excluded.short_description, long_description = excluded.long_description, icon = excluded.icon, category_id = excluded.category_id, engine_type = excluded.engine_type, difficulty = excluded.difficulty, estimated_duration_minutes = excluded.estimated_duration_minutes, question_count = excluded.question_count, featured = excluded.featured, access = excluded.access, status = excluded.status\n    returning id into v_ass;`
    );

    for (const dim of data.scoringDimensions ?? []) {
      L.push(
        `  insert into scoring_dimensions (assessment_id, key, label, description, contributes_to_brain_profile, brain_profile_dimension_key, "order") values (v_ass, ${s(dim.key)}, ${s(dim.label)}, ${s(dim.description ?? null)}, ${dim.contributesToBrainProfile ? "true" : "false"}, ${s(dim.brainProfileDimensionKey ?? null)}, ${n(dim.order)})\n    on conflict (assessment_id, key) do update set label = excluded.label, description = excluded.description, contributes_to_brain_profile = excluded.contributes_to_brain_profile, brain_profile_dimension_key = excluded.brain_profile_dimension_key, "order" = excluded."order";`
      );
    }

    L.push(`  delete from result_ranges where assessment_id = v_ass;`);
    for (const r of data.resultRanges ?? []) {
      L.push(
        `  insert into result_ranges (assessment_id, dimension_key, min_score, max_score, title, description, recommendations, icon, "order") values (v_ass, ${s(r.dimensionKey)}, ${n(r.minScore)}, ${n(r.maxScore)}, ${s(r.title)}, ${s(r.description)}, ${arr(r.recommendations ?? [])}, ${s(r.icon ?? null)}, ${n(r.order)});`
      );
    }

    L.push(`  delete from brain_profile_contribution_rules where assessment_id = v_ass;`);
    for (const c of data.brainProfileContributions ?? []) {
      L.push(
        `  insert into brain_profile_contribution_rules (assessment_id, source_dimension_key, target_brain_profile_dimension_key, weight) values (v_ass, ${s(c.sourceDimensionKey)}, ${s(c.targetBrainProfileDimensionKey)}, ${n(c.weight)});`
      );
    }

    const sections = data.sections ?? [];
    if (sections.length === 0) {
      // Coming-soon placeholder: metadata row only, no playable version.
      L.push("end $$;");
      flush(`assessment ${data.slug}`);
      continue;
    }

    L.push(
      `  select coalesce(max(version_number), 0) + 1 into v_num from assessment_versions where assessment_id = v_ass;`
    );
    L.push(
      `  insert into assessment_versions (assessment_id, version_number, status, settings, published_at) values (v_ass, v_num, 'published'::assessment_status, ${j({ ...DEFAULT_SETTINGS, ...(data.runnerSettings ?? {}) })}, now()) returning id into v_ver;`
    );
    L.push(`  update assessments set current_version_id = v_ver where id = v_ass;`);

    for (const section of sections) {
      L.push(
        `  insert into assessment_sections (assessment_version_id, name, description, instructions, time_limit_seconds, randomize_questions, weight, "order") values (v_ver, ${s(section.name)}, ${s(section.description ?? null)}, ${s(section.instructions ?? null)}, ${n(section.timeLimitSeconds ?? null)}, ${section.randomizeQuestions ? "true" : "false"}, ${n(section.weight ?? 1)}, ${n(section.order)});`
      );
    }

    for (const rule of data.scoringRules ?? []) {
      L.push(
        `  insert into scoring_rules (assessment_version_id, dimension_key, formula, section_weights, normalization, penalty_per_incorrect) values (v_ver, ${s(rule.dimensionKey)}, ${s(rule.formula)}::scoring_formula, ${j(rule.sectionWeights ?? null)}, ${j(rule.normalization ?? null)}, ${n(rule.penaltyPerIncorrect ?? null)});`
      );
    }

    // Section names are unique within a version, so link by (version, name).
    const sectionNameByKey = new Map<string, string>();
    for (const section of sections) sectionNameByKey.set(section.key, section.name);

    const links: string[] = [];
    (data.questions ?? []).forEach((q: any, i: number) => {
      const sectionName = sectionNameByKey.get(q.sectionKey);
      if (!sectionName) return;
      links.push(
        `(v_ver, (select id from assessment_sections where assessment_version_id = v_ver and name = ${s(sectionName)}), (select id from questions where external_key = ${s(q.key)}), ${n(q.order ?? i)}, ${n(q.weight ?? 1)})`
      );
    });
    (data.reuseQuestionKeys ?? []).forEach((ref: any) => {
      const sectionName = sectionNameByKey.get(ref.sectionKey);
      if (!sectionName) throw new Error(`[${file}] reuseQuestionKeys: unknown sectionKey "${ref.sectionKey}"`);
      links.push(
        `(v_ver, (select id from assessment_sections where assessment_version_id = v_ver and name = ${s(sectionName)}), (select id from questions where external_key = ${s(ref.questionKey)}), ${n(ref.order)}, ${n(ref.weight ?? 1)})`
      );
    });

    if (links.length > 0) {
      L.push(
        `  insert into assessment_questions (assessment_version_id, section_id, question_id, "order", weight) values\n    ${links.join(",\n    ")};`
      );
    }

    L.push("end $$;");
    flush(`assessment ${data.slug}`);
  }

  const header = (partNote: string) =>
    [
      "-- EvalOtter seed data — generated by scripts/seed/generate-sql.ts",
      "-- Equivalent to `npm run seed`. Idempotent: safe to re-run.",
      `-- ${seeds.length} assessments from scripts/seed/data/*.json`,
      "-- Run AFTER the schema migrations (supabase/combined_migrations.sql).",
      partNote,
      "",
      "begin;",
      "",
    ].join("\n");
  const footer = "\ncommit;\n";

  const parts = Number(process.argv[3] ?? 1);
  if (!Number.isInteger(parts) || parts < 1) throw new Error("part count must be a positive integer");

  if (parts === 1) {
    writeFileSync(out, header("") + units.map((u) => u.sql).join("\n\n") + footer);
    console.log(`Wrote ${out} (${seeds.length} assessments, ${units.length} units)`);
    return;
  }

  // Balance by byte size, never splitting a unit, order strictly preserved.
  const total = units.reduce((acc, u) => acc + u.sql.length, 0);
  const target = total / parts;
  const buckets: { label: string; sql: string }[][] = Array.from({ length: parts }, () => []);
  let bucket = 0;
  let acc = 0;
  for (const u of units) {
    // Move on once this bucket has had its share, keeping room for the rest.
    if (bucket < parts - 1 && acc >= target * (bucket + 1)) bucket++;
    buckets[bucket]!.push(u);
    acc += u.sql.length;
  }

  const base = out.replace(/\.sql$/, "");
  buckets.forEach((b, i) => {
    const nth = i + 1;
    const note =
      `-- PART ${nth} OF ${parts} — run the parts IN ORDER (part1 first).\n` +
      `-- Ordering is load-bearing: categories, then every question, then the\n` +
      `-- assessments that link them (the flagship reuses other assessments'\n` +
      `-- questions). Each part is its own transaction.`;
    const file = `${base}.part${nth}of${parts}.sql`;
    writeFileSync(file, header(note) + b.map((u) => u.sql).join("\n\n") + footer);
    const kb = Math.round(b.reduce((a2, u) => a2 + u.sql.length, 0) / 1024);
    console.log(`Wrote ${file} — ${b.length} units, ~${kb} KB`);
  });
}

main();
