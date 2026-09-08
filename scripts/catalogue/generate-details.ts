/**
 * Generates `src/config/assessment-details.ts` from the seed JSON.
 *
 * The assessment detail page needs richer display data than the flat
 * CATALOGUE carries — sections, scoring dimensions, score bands, the
 * provenance note — so it can render a real page before (or independently
 * of) the database being seeded.
 *
 * This is GENERATED rather than hand-maintained so it cannot drift from
 * `scripts/seed/data/*.json`, which is the single source of truth. It
 * deliberately carries NO question content: prompts, options and the
 * base64 SVG media stay out of the client bundle.
 *
 *   npx tsx scripts/catalogue/generate-details.ts
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), "scripts/seed/data");
const OUT = join(process.cwd(), "src/config/assessment-details.ts");

interface SeedSection {
  key: string;
  name: string;
  description: string | null;
  timeLimitSeconds: number | null;
  order: number;
}
interface SeedDimension {
  key: string;
  label: string;
  description: string | null;
  contributesToBrainProfile?: boolean;
  order: number;
}
interface SeedRange {
  dimensionKey: string;
  minScore: number;
  maxScore: number;
  title: string;
}
interface SeedQuestion {
  sectionKey: string | null;
  questionType: string;
}
interface SeedAssessment {
  slug: string;
  sourceNote?: string | null;
  sections?: SeedSection[];
  scoringDimensions?: SeedDimension[];
  resultRanges?: SeedRange[];
  questions?: SeedQuestion[];
}

const files = readdirSync(DATA_DIR).filter((f) => f.endsWith(".json")).sort();
const entries: string[] = [];

for (const file of files) {
  const raw = JSON.parse(readFileSync(join(DATA_DIR, file), "utf8")) as SeedAssessment | unknown;
  if (!raw || typeof raw !== "object" || !("slug" in raw)) continue;
  const a = raw as SeedAssessment;

  const questions = a.questions ?? [];
  const perSection = new Map<string, number>();
  for (const q of questions) {
    if (!q.sectionKey) continue;
    perSection.set(q.sectionKey, (perSection.get(q.sectionKey) ?? 0) + 1);
  }

  const sections = [...(a.sections ?? [])]
    .sort((x, y) => x.order - y.order)
    .map((s) => ({
      key: s.key,
      name: s.name,
      description: s.description ?? null,
      questionCount: perSection.get(s.key) ?? 0,
      timeLimitSeconds: s.timeLimitSeconds ?? null,
    }));

  const dimensions = [...(a.scoringDimensions ?? [])]
    .sort((x, y) => x.order - y.order)
    .map((d) => ({
      key: d.key,
      label: d.label,
      description: d.description ?? null,
      contributesToBrainProfile: Boolean(d.contributesToBrainProfile),
    }));

  // Score bands for the headline "overall" dimension, lowest band first —
  // these tell a visitor what the report actually says about them.
  const bands = (a.resultRanges ?? [])
    .filter((r) => r.dimensionKey === "overall")
    .sort((x, y) => x.minScore - y.minScore)
    .map((r) => ({ title: r.title, minScore: r.minScore, maxScore: r.maxScore }));

  const questionTypes = [...new Set(questions.map((q) => q.questionType))].sort();

  entries.push(
    `  ${JSON.stringify(a.slug)}: ${JSON.stringify(
      { sections, dimensions, bands, questionTypes, sourceNote: a.sourceNote ?? null },
      null,
      2
    )
      .split("\n")
      .join("\n  ")},`
  );
}

const body = `// GENERATED FILE — DO NOT EDIT BY HAND.
// Source: scripts/seed/data/*.json
// Regenerate: npx tsx scripts/catalogue/generate-details.ts
//
// Display-only metadata for the assessment detail page. Carries no question
// content, so importing it costs the bundle nothing but a few KB of prose.

export interface AssessmentDetailSection {
  key: string;
  name: string;
  description: string | null;
  questionCount: number;
  timeLimitSeconds: number | null;
}

export interface AssessmentDetailDimension {
  key: string;
  label: string;
  description: string | null;
  contributesToBrainProfile: boolean;
}

export interface AssessmentDetailBand {
  title: string;
  minScore: number;
  maxScore: number;
}

export interface AssessmentDetail {
  sections: AssessmentDetailSection[];
  dimensions: AssessmentDetailDimension[];
  bands: AssessmentDetailBand[];
  questionTypes: string[];
  sourceNote: string | null;
}

export const ASSESSMENT_DETAILS: Record<string, AssessmentDetail> = {
${entries.join("\n")}
};

export function getAssessmentDetail(slug: string): AssessmentDetail | undefined {
  return ASSESSMENT_DETAILS[slug];
}
`;

writeFileSync(OUT, body, "utf8");
console.log(`Wrote ${OUT} (${entries.length} assessments, ${(body.length / 1024).toFixed(1)} KB)`);
