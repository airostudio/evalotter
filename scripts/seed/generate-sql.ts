/**
 * Emits idempotent .sql equivalent to `npm run seed`, for environments that
 * cannot reach the Supabase host over the network (paste into the Supabase
 * SQL editor instead).
 *
 * Usage:
 *   npx tsx scripts/seed/generate-sql.ts supabase/seed_data.sql        # one file
 *   npx tsx scripts/seed/generate-sql.ts supabase/seed_data.sql 5      # 5 parts
 *   npx tsx scripts/seed/generate-sql.ts --per-test supabase/seed      # one file per assessment
 *
 * --per-test writes supabase/seed/NN-<slug>.sql, one per assessment, each
 * self-contained (its category, its own questions, then the assessment). Run
 * them in filename order: the numbering exists because assessments that reuse
 * another assessment's questions (the flagship profile) are emitted last.
 *
 * Split output is written as <name>.partNofM.sql and MUST be run in order:
 * categories first, then every question, and only then the assessments —
 * because assessment_questions resolves questions by external_key, and the
 * flagship profile reuses questions owned by other assessments.
 *
 * The emitted SQL is deliberately written to survive clients that split a
 * script on ";" without understanding SQL quoting — the Supabase SQL editor
 * does exactly that, which shredded an earlier version of this file. So:
 *   - no literal ever contains a raw ";" (they are emitted as
 *     '...' || chr(59) || '...', which Postgres folds back to the same text).
 *     Seed content is full of them: "data:image/svg+xml;base64,..." URIs and
 *     ordinary prose semicolons.
 *   - no DO $$ ... $$ blocks, whose internal semicolons would be cut the same
 *     way. Generated ids are threaded through subselects on stable keys
 *     (assessments.slug, questions.external_key, section name) instead of
 *     plpgsql variables.
 *   - every cast is parenthesised, since "::" binds tighter than "||".
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "fs";
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

/**
 * SQL text expression for a value.
 *
 * Anything containing a character that a naive SQL splitter can trip over is
 * emitted base64-encoded and decoded back by Postgres, so the literal itself
 * is nothing but [A-Za-z0-9+/=]. Plain values stay readable.
 *
 * The dangerous set, all of which occur in real seed content:
 *   '   apostrophes in prose — doubled correctly, but some clients miscount
 *   "   JSON payloads are full of them; a literal with an ODD number of them
 *       desyncs any client that tracks double-quoted identifiers without
 *       noticing it is inside a single-quoted string. That is what turned
 *       "Push into distribution-of-three items" into INSERT INTO distribution.
 *   ;   "data:image/svg+xml;base64,..." URIs and prose semicolons, which
 *       clients that split on ";" cut mid-literal
 *   --  would start a comment for a client that strips comments first
 */
function s(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  const str = String(v);
  if (!/['";]/.test(str) && !str.includes("--")) return `'${str}'`;
  const b64 = Buffer.from(str, "utf8").toString("base64");
  return `convert_from(decode('${b64}', 'base64'), 'UTF8')`;
}
/** Numeric/boolean literal, or NULL. */
function n(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  return String(v);
}
/** Parenthesised cast — "::" binds tighter than "||". */
function cast(expr: string, type: string): string {
  if (expr === "NULL") return `NULL::${type}`;
  return `(${expr})::${type}`;
}
/** jsonb expression, or NULL. */
function j(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  return cast(s(JSON.stringify(v)), "jsonb");
}
/** text[] expression. */
function arr(v: unknown): string {
  const items = Array.isArray(v) ? v : [];
  if (items.length === 0) return `'{}'::text[]`;
  return `ARRAY[${items.map((x) => s(x)).join(", ")}]::text[]`;
}
/** Subselects on stable keys, standing in for plpgsql variables. */
const assessmentId = (slug: string) => `(select id from assessments where slug = ${s(slug)})`;
const questionId = (key: string) => `(select id from questions where external_key = ${s(key)})`;
const categoryId = (key: string) => `(select id from assessment_categories where key = ${s(key)})`;
const currentVersionId = (slug: string) =>
  `(select current_version_id from assessments where slug = ${s(slug)})`;
const sectionId = (slug: string, name: string) =>
  `(select id from assessment_sections where assessment_version_id = ${currentVersionId(slug)} and name = ${s(name)})`;

/** Statements for one category. */
function categoryUnit(key: string): string {
  const meta = CATEGORY_LABELS[key];
  if (!meta) throw new Error(`No label metadata for category "${key}"`);
  return (
    `insert into assessment_categories (key, label, icon, "order") values (${s(key)}, ${s(meta.label)}, ${s(meta.icon)}, ${meta.order})\n` +
    `  on conflict (key) do update set label = excluded.label, icon = excluded.icon, "order" = excluded."order";`
  );
}

function main() {
  const perTest = process.argv[2] === "--per-test";
  const args = perTest ? process.argv.slice(3) : process.argv.slice(2);
  const out = args[0] ?? (perTest ? "supabase/seed" : "supabase/seed_data.sql");
  const dataDir = join(__dirname, "data");
  const files = readdirSync(dataDir).filter((f) => f.endsWith(".json")).sort();
  const seeds = files.flatMap((f) => {
    const parsed = JSON.parse(readFileSync(join(dataDir, f), "utf8"));
    const entries = Array.isArray(parsed) ? parsed : [parsed];
    return entries.map((data: any) => ({ file: f, data }));
  });

  // Each "unit" is a self-contained group of statements, emitted in
  // dependency order and never split internally. `owner` is the slug the
  // unit belongs to, so --per-test can regroup them by assessment.
  const units: { kind: "category" | "question" | "assessment"; owner: string; sql: string }[] = [];
  let L: string[] = [];
  let pending: { kind: "category" | "question" | "assessment"; owner: string } = {
    kind: "category",
    owner: "",
  };
  const flush = () => {
    if (L.length > 0) units.push({ ...pending, sql: L.join("\n") });
    L = [];
  };
  const begin = (kind: "category" | "question" | "assessment", owner: string) => {
    pending = { kind, owner };
  };

  // ---- Categories --------------------------------------------------------
  const usedCategoryKeys = [...new Set(seeds.map((x) => x.data.categoryKey))];
  for (const key of usedCategoryKeys as string[]) {
    begin("category", key);
    L.push(categoryUnit(key));
    flush();
  }

  // ---- Pass 1: questions + options ---------------------------------------
  // Every question must exist before ANY assessment links them: the flagship
  // profile reuses questions owned by other assessments.
  for (const { data } of seeds) {
    for (const q of data.questions ?? []) {
      begin("question", data.slug);
      L.push(
        `insert into questions (external_key, question_type, question_text, instructions, media, correct_answer, score_config, difficulty, category, tags, time_limit_seconds, required) values (` +
          [
            s(q.key),
            cast(s(q.questionType), "question_type"),
            s(q.questionText),
            s(q.instructions ?? null),
            j(q.media ?? []),
            j(q.correctAnswer ?? null),
            j(q.scoreConfig ?? []),
            q.difficulty ? cast(s(q.difficulty), "assessment_difficulty") : "NULL",
            s(data.slug),
            arr(q.tags ?? []),
            n(q.timeLimitSeconds ?? null),
            q.required === false ? "false" : "true",
          ].join(", ") +
          `)\n  on conflict (external_key) do update set question_type = excluded.question_type, question_text = excluded.question_text, instructions = excluded.instructions, media = excluded.media, correct_answer = excluded.correct_answer, score_config = excluded.score_config, difficulty = excluded.difficulty, category = excluded.category, tags = excluded.tags, time_limit_seconds = excluded.time_limit_seconds, required = excluded.required;`
      );
      L.push(`delete from question_options where question_id = ${questionId(q.key)};`);
      const opts = q.options ?? [];
      if (opts.length > 0) {
        const rows = opts.map(
          (opt: any, i: number) =>
            `(${questionId(q.key)}, ${s(opt.label)}, ${s(opt.value)}, ${s(opt.imageUrl ?? null)}, ${opt.isCorrect === undefined || opt.isCorrect === null ? "NULL" : String(opt.isCorrect)}, ${i}, ${j(opt.scoreConfig ?? [])})`
        );
        L.push(
          `insert into question_options (question_id, label, value, image_url, is_correct, "order", score_config) values\n  ${rows.join(",\n  ")};`
        );
      }
      flush();
    }
  }

  // ---- Pass 2: assessments and everything hanging off them ---------------
  for (const { file, data } of seeds) {
    const slug: string = data.slug;
    begin("assessment", slug);
    const totalQuestionCount = (data.questions?.length ?? 0) + (data.reuseQuestionKeys?.length ?? 0);
    L.push(`-- ${slug} (${file})`);
    L.push(
      `insert into assessments (slug, title, short_description, long_description, icon, category_id, engine_type, difficulty, estimated_duration_minutes, question_count, featured, access, status) values (` +
        [
          s(slug),
          s(data.title),
          s(data.shortDescription),
          s(data.longDescription ?? ""),
          s(data.icon),
          categoryId(data.categoryKey),
          cast(s(data.engineType), "assessment_engine_type"),
          cast(s(data.difficulty), "assessment_difficulty"),
          n(data.estimatedDurationMinutes),
          n(totalQuestionCount),
          data.featured ? "true" : "false",
          cast(s(data.access), "assessment_access"),
          cast(s(data.status ?? "published"), "assessment_status"),
        ].join(", ") +
        `)\n  on conflict (slug) do update set title = excluded.title, short_description = excluded.short_description, long_description = excluded.long_description, icon = excluded.icon, category_id = excluded.category_id, engine_type = excluded.engine_type, difficulty = excluded.difficulty, estimated_duration_minutes = excluded.estimated_duration_minutes, question_count = excluded.question_count, featured = excluded.featured, access = excluded.access, status = excluded.status;`
    );

    for (const dim of data.scoringDimensions ?? []) {
      L.push(
        `insert into scoring_dimensions (assessment_id, key, label, description, contributes_to_brain_profile, brain_profile_dimension_key, "order") values (${assessmentId(slug)}, ${s(dim.key)}, ${s(dim.label)}, ${s(dim.description ?? null)}, ${dim.contributesToBrainProfile ? "true" : "false"}, ${s(dim.brainProfileDimensionKey ?? null)}, ${n(dim.order)})\n  on conflict (assessment_id, key) do update set label = excluded.label, description = excluded.description, contributes_to_brain_profile = excluded.contributes_to_brain_profile, brain_profile_dimension_key = excluded.brain_profile_dimension_key, "order" = excluded."order";`
      );
    }

    L.push(`delete from result_ranges where assessment_id = ${assessmentId(slug)};`);
    for (const r of data.resultRanges ?? []) {
      L.push(
        `insert into result_ranges (assessment_id, dimension_key, min_score, max_score, title, description, recommendations, icon, "order") values (${assessmentId(slug)}, ${s(r.dimensionKey)}, ${n(r.minScore)}, ${n(r.maxScore)}, ${s(r.title)}, ${s(r.description)}, ${arr(r.recommendations ?? [])}, ${s(r.icon ?? null)}, ${n(r.order)});`
      );
    }

    L.push(`delete from brain_profile_contribution_rules where assessment_id = ${assessmentId(slug)};`);
    for (const c of data.brainProfileContributions ?? []) {
      L.push(
        `insert into brain_profile_contribution_rules (assessment_id, source_dimension_key, target_brain_profile_dimension_key, weight) values (${assessmentId(slug)}, ${s(c.sourceDimensionKey)}, ${s(c.targetBrainProfileDimensionKey)}, ${n(c.weight)});`
      );
    }

    const sections = data.sections ?? [];
    if (sections.length === 0) {
      // Coming-soon placeholder: metadata row only, no playable version.
      flush();
      continue;
    }

    // New version every run — never mutate a published one.
    L.push(
      `insert into assessment_versions (assessment_id, version_number, status, settings, published_at)\n` +
        `  select a.id, coalesce((select max(v.version_number) from assessment_versions v where v.assessment_id = a.id), 0) + 1, 'published'::assessment_status, ${j({ ...DEFAULT_SETTINGS, ...(data.runnerSettings ?? {}) })}, now()\n` +
        `  from assessments a where a.slug = ${s(slug)};`
    );
    L.push(
      `update assessments set current_version_id = (select v.id from assessment_versions v where v.assessment_id = assessments.id order by v.version_number desc limit 1) where slug = ${s(slug)};`
    );

    for (const section of sections) {
      L.push(
        `insert into assessment_sections (assessment_version_id, name, description, instructions, time_limit_seconds, randomize_questions, weight, "order") values (${currentVersionId(slug)}, ${s(section.name)}, ${s(section.description ?? null)}, ${s(section.instructions ?? null)}, ${n(section.timeLimitSeconds ?? null)}, ${section.randomizeQuestions ? "true" : "false"}, ${n(section.weight ?? 1)}, ${n(section.order)});`
      );
    }

    for (const rule of data.scoringRules ?? []) {
      L.push(
        `insert into scoring_rules (assessment_version_id, dimension_key, formula, section_weights, normalization, penalty_per_incorrect) values (${currentVersionId(slug)}, ${s(rule.dimensionKey)}, ${cast(s(rule.formula), "scoring_formula")}, ${j(rule.sectionWeights ?? null)}, ${j(rule.normalization ?? null)}, ${n(rule.penaltyPerIncorrect ?? null)});`
      );
    }

    // Section names are unique within a version, so link by (version, name).
    const sectionNameByKey = new Map<string, string>();
    for (const section of sections) sectionNameByKey.set(section.key, section.name);

    const links: string[] = [];
    (data.questions ?? []).forEach((q: any, i: number) => {
      const name = sectionNameByKey.get(q.sectionKey);
      if (!name) return;
      links.push(
        `(${currentVersionId(slug)}, ${sectionId(slug, name)}, ${questionId(q.key)}, ${n(q.order ?? i)}, ${n(q.weight ?? 1)})`
      );
    });
    (data.reuseQuestionKeys ?? []).forEach((ref: any) => {
      const name = sectionNameByKey.get(ref.sectionKey);
      if (!name) throw new Error(`[${file}] reuseQuestionKeys: unknown sectionKey "${ref.sectionKey}"`);
      links.push(
        `(${currentVersionId(slug)}, ${sectionId(slug, name)}, ${questionId(ref.questionKey)}, ${n(ref.order)}, ${n(ref.weight ?? 1)})`
      );
    });

    if (links.length > 0) {
      L.push(
        `insert into assessment_questions (assessment_version_id, section_id, question_id, "order", weight) values\n  ${links.join(",\n  ")};`
      );
    }

    flush();
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

  if (perTest) {
    // One file per assessment: its category, its own questions, then itself.
    // Assessments that reuse another's questions must come after their
    // sources, so they are ordered last and the ordering is then verified.
    const reuses = (d: any) => (d.reuseQuestionKeys ?? []).length > 0;
    const ordered = [
      ...seeds.filter((x) => !reuses(x.data)),
      ...seeds.filter((x) => reuses(x.data)),
    ];

    const ownedBy = new Map<string, string>(); // question key -> owning slug
    for (const { data } of seeds) {
      for (const q of data.questions ?? []) ownedBy.set(q.key, data.slug);
    }
    const position = new Map<string, number>();
    ordered.forEach((x, i) => position.set(x.data.slug, i));
    for (const { data } of ordered) {
      for (const ref of data.reuseQuestionKeys ?? []) {
        const source = ownedBy.get(ref.questionKey);
        if (!source) throw new Error(`${data.slug}: reuses unknown question "${ref.questionKey}"`);
        if (position.get(source)! >= position.get(data.slug)!) {
          throw new Error(
            `${data.slug} reuses a question owned by ${source}, which is not emitted earlier — ordering is wrong`
          );
        }
      }
    }

    mkdirSync(out, { recursive: true });
    const width = String(ordered.length).length;
    ordered.forEach((x, i) => {
      const slug: string = x.data.slug;
      const nth = String(i + 1).padStart(width, "0");
      const mine = units.filter((u) => u.kind !== "category" && u.owner === slug);
      const cat = units.find((u) => u.kind === "category" && u.owner === x.data.categoryKey)!;
      const note =
        `-- ${slug} — file ${i + 1} of ${ordered.length}. Self-contained: its\n` +
        `-- category, its own questions, then the assessment itself.\n` +
        (reuses(x.data)
          ? `-- Reuses questions owned by other assessments, so run the earlier\n-- numbered files first.\n`
          : "") +
        `-- Safe to re-run on its own.`;
      const file = join(out, `${nth}-${slug}.sql`);
      writeFileSync(file, header(note) + [cat, ...mine].map((u) => u.sql).join("\n\n") + footer);
      const kb = Math.round([cat, ...mine].reduce((a2, u) => a2 + u.sql.length, 0) / 1024);
      console.log(`${nth}-${slug}.sql — ${mine.length} units, ~${kb} KB`);
    });
    console.log(`\nWrote ${ordered.length} files to ${out}/ — run them in filename order.`);
    return;
  }

  const parts = Number(args[1] ?? 1);
  if (!Number.isInteger(parts) || parts < 1) throw new Error("part count must be a positive integer");

  if (parts === 1) {
    writeFileSync(out, header("") + units.map((u) => u.sql).join("\n\n") + footer);
    console.log(`Wrote ${out} (${seeds.length} assessments, ${units.length} units)`);
    return;
  }

  // Balance by byte size, never splitting a unit, order strictly preserved.
  const total = units.reduce((acc, u) => acc + u.sql.length, 0);
  const target = total / parts;
  const buckets: (typeof units)[] = Array.from({ length: parts }, () => []);
  let bucket = 0;
  let acc = 0;
  for (const u of units) {
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
      `-- assessments that link them. Each part is its own transaction.`;
    const file = `${base}.part${nth}of${parts}.sql`;
    writeFileSync(file, header(note) + b.map((u) => u.sql).join("\n\n") + footer);
    const kb = Math.round(b.reduce((a2, u) => a2 + u.sql.length, 0) / 1024);
    console.log(`Wrote ${file} — ${b.length} units, ~${kb} KB`);
  });
}

main();
