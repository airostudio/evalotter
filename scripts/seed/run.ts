/**
 * Populates a connected Supabase project from scripts/seed/data/*.json.
 *
 * Usage:
 *   npm run seed:validate   # static checks, no DB needed — run this first
 *   npm run seed            # requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *
 * Re-runnable: each run publishes a fresh assessment_version per assessment
 * (never mutates a previously-published one, per the versioning principle),
 * while questions/dimensions/result-ranges/categories are upserted in place
 * keyed by stable external identifiers (external_key, category key,
 * assessment slug, dimension key) rather than duplicated.
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

loadDotEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Set them in .env.local (or the environment) before running `npm run seed`."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

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

async function main() {
  const dataDir = join(__dirname, "data");
  const files = readdirSync(dataDir).filter((f) => f.endsWith(".json"));
  const seeds = files.map((f) => ({
    file: f,
    data: JSON.parse(readFileSync(join(dataDir, f), "utf8")),
  }));

  console.log(`Seeding ${seeds.length} assessments from scripts/seed/data/...\n`);

  // ---- Categories --------------------------------------------------------
  const categoryIds = new Map<string, string>();
  const usedCategoryKeys = new Set(seeds.map((s) => s.data.categoryKey));
  for (const key of usedCategoryKeys) {
    const meta = CATEGORY_LABELS[key];
    if (!meta) throw new Error(`No label metadata for category "${key}" — add it to CATEGORY_LABELS in run.ts`);
    const { data, error } = await supabase
      .from("assessment_categories")
      .upsert({ key, label: meta.label, icon: meta.icon, order: meta.order }, { onConflict: "key" })
      .select("id")
      .single();
    if (error) throw error;
    categoryIds.set(key, data.id);
  }
  console.log(`✓ ${categoryIds.size} categories`);

  // ---- Pass 1: upsert every directly-authored question + its options -----
  // Must run for ALL assessments before any assessment_questions linking,
  // since reuseQuestionKeys can reference a question owned by a file
  // processed later.
  const questionIdByExternalKey = new Map<string, string>();

  for (const { file, data } of seeds) {
    for (const q of data.questions ?? []) {
      const { data: row, error } = await supabase
        .from("questions")
        .upsert(
          {
            external_key: q.key,
            question_type: q.questionType,
            question_text: q.questionText,
            instructions: q.instructions ?? null,
            media: q.media ?? [],
            correct_answer: q.correctAnswer ?? null,
            score_config: q.scoreConfig ?? [],
            difficulty: q.difficulty ?? null,
            category: data.slug,
            tags: q.tags ?? [],
            time_limit_seconds: q.timeLimitSeconds ?? null,
            required: q.required ?? true,
          },
          { onConflict: "external_key" }
        )
        .select("id")
        .single();
      if (error) throw new Error(`[${file}] question "${q.key}": ${error.message}`);
      questionIdByExternalKey.set(q.key, row.id);

      // Options are cheap to fully replace on every run rather than diffed.
      await supabase.from("question_options").delete().eq("question_id", row.id);
      const options = (q.options ?? []).map((opt: any, i: number) => ({
        question_id: row.id,
        label: opt.label,
        value: opt.value,
        image_url: opt.imageUrl ?? null,
        is_correct: opt.isCorrect ?? null,
        order: i,
        score_config: opt.scoreConfig ?? [],
      }));
      if (options.length > 0) {
        const { error: optError } = await supabase.from("question_options").insert(options);
        if (optError) throw new Error(`[${file}] options for "${q.key}": ${optError.message}`);
      }
    }
  }
  console.log(`✓ ${questionIdByExternalKey.size} questions upserted into the shared library`);

  // ---- Pass 2: assessment, version, sections, dimensions, ranges, links --
  for (const { file, data } of seeds) {
    const categoryId = categoryIds.get(data.categoryKey);
    if (!categoryId) throw new Error(`[${file}] unknown categoryKey "${data.categoryKey}"`);

    const totalQuestionCount = (data.questions?.length ?? 0) + (data.reuseQuestionKeys?.length ?? 0);

    const { data: assessment, error: assessmentError } = await supabase
      .from("assessments")
      .upsert(
        {
          slug: data.slug,
          title: data.title,
          short_description: data.shortDescription,
          long_description: data.longDescription,
          icon: data.icon,
          category_id: categoryId,
          engine_type: data.engineType,
          difficulty: data.difficulty,
          estimated_duration_minutes: data.estimatedDurationMinutes,
          question_count: totalQuestionCount,
          featured: data.featured ?? false,
          access: data.access,
          status: "published",
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();
    if (assessmentError) throw new Error(`[${file}] assessment: ${assessmentError.message}`);
    const assessmentId: string = assessment.id;

    // Scoring dimensions & result ranges are assessment-level (shared across
    // versions) — upsert/replace rather than duplicate.
    for (const dim of data.scoringDimensions) {
      const { error } = await supabase.from("scoring_dimensions").upsert(
        {
          assessment_id: assessmentId,
          key: dim.key,
          label: dim.label,
          description: dim.description ?? null,
          contributes_to_brain_profile: dim.contributesToBrainProfile,
          brain_profile_dimension_key: dim.brainProfileDimensionKey ?? null,
          order: dim.order,
        },
        { onConflict: "assessment_id,key" }
      );
      if (error) throw new Error(`[${file}] scoring dimension "${dim.key}": ${error.message}`);
    }

    await supabase.from("result_ranges").delete().eq("assessment_id", assessmentId);
    if (data.resultRanges.length > 0) {
      const { error } = await supabase.from("result_ranges").insert(
        data.resultRanges.map((r: any) => ({
          assessment_id: assessmentId,
          dimension_key: r.dimensionKey,
          min_score: r.minScore,
          max_score: r.maxScore,
          title: r.title,
          description: r.description,
          recommendations: r.recommendations ?? [],
          icon: r.icon ?? null,
          order: r.order,
        }))
      );
      if (error) throw new Error(`[${file}] result ranges: ${error.message}`);
    }

    await supabase.from("brain_profile_contribution_rules").delete().eq("assessment_id", assessmentId);
    if ((data.brainProfileContributions ?? []).length > 0) {
      const { error } = await supabase.from("brain_profile_contribution_rules").insert(
        data.brainProfileContributions.map((c: any) => ({
          assessment_id: assessmentId,
          source_dimension_key: c.sourceDimensionKey,
          target_brain_profile_dimension_key: c.targetBrainProfileDimensionKey,
          weight: c.weight,
        }))
      );
      if (error) throw new Error(`[${file}] brain profile contributions: ${error.message}`);
    }

    // New version every run — never mutate a previously-published one.
    const { data: existingVersions } = await supabase
      .from("assessment_versions")
      .select("version_number")
      .eq("assessment_id", assessmentId)
      .order("version_number", { ascending: false })
      .limit(1);
    const nextVersionNumber = (existingVersions?.[0]?.version_number ?? 0) + 1;

    const defaultSettings = {
      allowBackNavigation: true,
      randomizeSections: false,
      randomizeQuestions: false,
      randomizeAnswerOrder: false,
      showProgressBar: true,
      showInstructionsBetweenSections: true,
      autosaveIntervalSeconds: 10,
      totalTimeLimitSeconds: null,
    };

    const { data: version, error: versionError } = await supabase
      .from("assessment_versions")
      .insert({
        assessment_id: assessmentId,
        version_number: nextVersionNumber,
        status: "published",
        settings: { ...defaultSettings, ...(data.runnerSettings ?? {}) },
        published_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (versionError) throw new Error(`[${file}] version: ${versionError.message}`);
    const versionId: string = version.id;

    await supabase.from("assessments").update({ current_version_id: versionId }).eq("id", assessmentId);

    const sectionIdByKey = new Map<string, string>();
    for (const section of data.sections) {
      const { data: row, error } = await supabase
        .from("assessment_sections")
        .insert({
          assessment_version_id: versionId,
          name: section.name,
          description: section.description ?? null,
          instructions: section.instructions ?? null,
          time_limit_seconds: section.timeLimitSeconds ?? null,
          randomize_questions: section.randomizeQuestions ?? false,
          weight: section.weight ?? 1,
          order: section.order,
        })
        .select("id")
        .single();
      if (error) throw new Error(`[${file}] section "${section.key}": ${error.message}`);
      sectionIdByKey.set(section.key, row.id);
    }

    for (const rule of data.scoringRules ?? []) {
      const { error } = await supabase.from("scoring_rules").insert({
        assessment_version_id: versionId,
        dimension_key: rule.dimensionKey,
        formula: rule.formula,
        section_weights: rule.sectionWeights ?? null,
        normalization: rule.normalization ?? null,
        penalty_per_incorrect: rule.penaltyPerIncorrect ?? null,
      });
      if (error) throw new Error(`[${file}] scoring rule "${rule.dimensionKey}": ${error.message}`);
    }

    const links: { assessment_version_id: string; section_id: string; question_id: string; order: number; weight: number }[] = [];

    (data.questions ?? []).forEach((q: any, i: number) => {
      const questionId = questionIdByExternalKey.get(q.key);
      const sectionId = sectionIdByKey.get(q.sectionKey);
      if (!questionId || !sectionId) return;
      links.push({
        assessment_version_id: versionId,
        section_id: sectionId,
        question_id: questionId,
        order: q.order ?? i,
        weight: q.weight ?? 1,
      });
    });

    (data.reuseQuestionKeys ?? []).forEach((ref: any) => {
      const questionId = questionIdByExternalKey.get(ref.questionKey);
      const sectionId = sectionIdByKey.get(ref.sectionKey);
      if (!questionId) throw new Error(`[${file}] reuseQuestionKeys: unknown question "${ref.questionKey}"`);
      if (!sectionId) throw new Error(`[${file}] reuseQuestionKeys: unknown sectionKey "${ref.sectionKey}"`);
      links.push({
        assessment_version_id: versionId,
        section_id: sectionId,
        question_id: questionId,
        order: ref.order,
        weight: ref.weight ?? 1,
      });
    });

    if (links.length > 0) {
      const { error } = await supabase.from("assessment_questions").insert(links);
      if (error) throw new Error(`[${file}] assessment_questions: ${error.message}`);
    }

    console.log(`✓ ${data.slug} — v${nextVersionNumber}, ${data.sections.length} sections, ${links.length} questions`);
  }

  console.log("\nSeed complete.");
}

/** Minimal .env.local loader so this script works standalone (outside `next dev`'s own env loading), without adding a dotenv dependency. */
function loadDotEnvLocal() {
  const path = join(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message ?? err);
  process.exit(1);
});
