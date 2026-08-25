/**
 * Static integrity check over scripts/seed/data/*.json — no database needed.
 * Run with: npx tsx scripts/seed/validate.ts
 *
 * Catches the class of bug this seed set has already hit once (a scoring
 * dimension declared but never actually targeted by any question's
 * scoreConfig, silently rendering as a dead 0 on the results page).
 */
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const DATA_DIR = join(__dirname, "data");

interface SeedFile {
  slug: string;
  status?: string;
  sections?: { key: string }[];
  scoringDimensions?: { key: string; contributesToBrainProfile: boolean; brainProfileDimensionKey?: string | null }[];
  resultRanges?: { dimensionKey: string; minScore: number; maxScore: number }[];
  questions?: any[];
  reuseQuestionKeys?: { questionKey: string; sectionKey: string }[];
  brainProfileContributions?: { sourceDimensionKey: string; targetBrainProfileDimensionKey: string }[];
}

const files = readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
let errors = 0;
let warnings = 0;

function fail(file: string, msg: string) {
  console.error(`✗ [${file}] ${msg}`);
  errors++;
}
function warn(file: string, msg: string) {
  console.warn(`  [${file}] ${msg}`);
  warnings++;
}

const allQuestionKeys = new Map<string, string>(); // key -> owning slug
const questionImpactDimensions = new Map<string, Set<string>>(); // key -> dimension keys its scoreConfig targets

// Pass 1: collect all question keys, check per-file uniqueness of section/dimension keys.
// A file's top-level JSON is normally one assessment object; it may instead
// be an array of several lightweight ones (used for content-less
// "coming soon" roadmap entries).
const parsed: { file: string; data: SeedFile }[] = [];
for (const file of files) {
  const rawParsed = JSON.parse(readFileSync(join(DATA_DIR, file), "utf8"));
  const entries: SeedFile[] = Array.isArray(rawParsed) ? rawParsed : [rawParsed];

  for (const data of entries) {
    parsed.push({ file, data });

    for (const q of data.questions ?? []) {
      if (allQuestionKeys.has(q.key)) {
        fail(file, `duplicate question key "${q.key}" (already defined in ${allQuestionKeys.get(q.key)})`);
      }
      allQuestionKeys.set(q.key, data.slug);

      const impacts = new Set<string>();
      for (const opt of q.options ?? []) for (const i of opt.scoreConfig ?? []) impacts.add(i.dimensionKey);
      for (const i of q.scoreConfig ?? []) impacts.add(i.dimensionKey);
      questionImpactDimensions.set(q.key, impacts);
    }
  }
}

// Pass 2: per-file structural checks. Skip entirely for content-less
// "coming soon" placeholders — they're not expected to have sections,
// dimensions, or result ranges yet.
for (const { file, data } of parsed) {
  if (data.status === "coming_soon") continue;

  const sectionKeys = new Set((data.sections ?? []).map((s) => s.key));
  const dimensionKeys = new Set((data.scoringDimensions ?? []).map((d) => d.key));

  for (const q of data.questions ?? []) {
    if (!sectionKeys.has(q.sectionKey)) {
      fail(file, `question "${q.key}" references unknown sectionKey "${q.sectionKey}"`);
    }

    const impactDimensions = new Set<string>();
    for (const opt of q.options ?? []) {
      for (const impact of opt.scoreConfig ?? []) impactDimensions.add(impact.dimensionKey);
    }
    for (const impact of q.scoreConfig ?? []) impactDimensions.add(impact.dimensionKey);

    for (const d of impactDimensions) {
      if (!dimensionKeys.has(d)) {
        warn(file, `question "${q.key}" scores dimension "${d}" which isn't declared in scoringDimensions`);
      }
    }
  }

  for (const ref of data.reuseQuestionKeys ?? []) {
    if (!allQuestionKeys.has(ref.questionKey)) {
      fail(file, `reuseQuestionKeys references unknown question "${ref.questionKey}"`);
      continue;
    }
    if (!sectionKeys.has(ref.sectionKey)) {
      fail(file, `reuseQuestionKeys entry for "${ref.questionKey}" references unknown sectionKey "${ref.sectionKey}"`);
    }

    // The reused question's own scoreConfig dimension keys must overlap with
    // this assessment's declared dimensions, or the response silently scores
    // nothing here even though it scores correctly in its owning assessment.
    const reusedImpacts = questionImpactDimensions.get(ref.questionKey) ?? new Set();
    const overlap = [...reusedImpacts].some((d) => dimensionKeys.has(d));
    if (reusedImpacts.size > 0 && !overlap) {
      fail(
        file,
        `reused question "${ref.questionKey}" (from ${allQuestionKeys.get(ref.questionKey)}) scores [${[...reusedImpacts].join(", ")}] but "${data.slug}" declares no matching scoringDimension — it will contribute 0 here`
      );
    }
  }

  // A scoring dimension that's never actually targeted by any question's scoreConfig
  // (directly or via reuse) renders as a dead 0/blank on the results page.
  const scoredDimensions = new Set<string>();
  for (const q of data.questions ?? []) {
    for (const opt of q.options ?? []) for (const i of opt.scoreConfig ?? []) scoredDimensions.add(i.dimensionKey);
    for (const i of q.scoreConfig ?? []) scoredDimensions.add(i.dimensionKey);
  }
  for (const dim of data.scoringDimensions ?? []) {
    if (!scoredDimensions.has(dim.key) && !(data.reuseQuestionKeys && data.reuseQuestionKeys.length > 0)) {
      warn(file, `scoring dimension "${dim.key}" is declared but no question's scoreConfig ever targets it`);
    }
  }

  // contributesToBrainProfile dimensions must name a target.
  for (const dim of data.scoringDimensions ?? []) {
    if (dim.contributesToBrainProfile && !dim.brainProfileDimensionKey) {
      fail(file, `dimension "${dim.key}" has contributesToBrainProfile:true but no brainProfileDimensionKey`);
    }
  }

  // "overall" result ranges should form a contiguous, gapless 0-100 cover.
  const overall = (data.resultRanges ?? []).filter((r) => r.dimensionKey === "overall").sort((a, b) => a.minScore - b.minScore);
  if (overall.length > 0) {
    const first = overall[0]!;
    const last = overall[overall.length - 1]!;
    if (first.minScore !== 0) fail(file, `overall result ranges don't start at 0 (start at ${first.minScore})`);
    if (last.maxScore !== 100) fail(file, `overall result ranges don't end at 100 (end at ${last.maxScore})`);
    for (let i = 1; i < overall.length; i++) {
      const curr = overall[i]!;
      const prev = overall[i - 1]!;
      if (curr.minScore !== prev.maxScore + 1) {
        fail(file, `gap/overlap in overall result ranges between ${prev.maxScore} and ${curr.minScore}`);
      }
    }
  } else {
    warn(file, `no "overall" result ranges declared`);
  }

  // brainProfileContributions should reference real scoring dimensions.
  for (const c of data.brainProfileContributions ?? []) {
    if (!dimensionKeys.has(c.sourceDimensionKey)) {
      fail(file, `brainProfileContributions references unknown sourceDimensionKey "${c.sourceDimensionKey}"`);
    }
  }
}

console.log(`\nChecked ${files.length} seed files, ${allQuestionKeys.size} total questions.`);
console.log(`${errors} error(s), ${warnings} warning(s).`);
if (errors > 0) process.exit(1);
