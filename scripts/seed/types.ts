import type {
  AssessmentAccess,
  AssessmentEngineType,
  AssessmentStatus,
  QuestionType,
} from "@/types";

/**
 * Authoring-time shape for one assessment's seed content. This is a
 * simplified, human-writable superset of the DB schema — `run.ts` expands
 * it into the actual relational inserts (categories are looked up by key,
 * questions get real UUIDs, etc).
 *
 * `key` fields (on sections, dimensions, questions) are stable slugs used
 * only within the seed data to wire references together — they are not
 * persisted as-is; `run.ts` maps them to generated UUIDs.
 */
export interface SeedAssessment {
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  icon: string;
  categoryKey: string;
  engineType: AssessmentEngineType;
  difficulty: "easy" | "medium" | "hard";
  estimatedDurationMinutes: number;
  access: AssessmentAccess;
  featured?: boolean;
  /** Defaults to "published". Use "coming_soon" for a roadmap teaser with no content — sections/questions may be empty in that case. */
  status?: AssessmentStatus;
  runnerSettings?: Partial<{
    allowBackNavigation: boolean;
    randomizeSections: boolean;
    randomizeQuestions: boolean;
    randomizeAnswerOrder: boolean;
    showProgressBar: boolean;
    showInstructionsBetweenSections: boolean;
    autosaveIntervalSeconds: number;
    totalTimeLimitSeconds: number | null;
  }>;

  /** Empty (or omitted) only for status:"coming_soon" placeholder assessments with no content yet. */
  sections?: SeedSection[];
  scoringDimensions?: SeedScoringDimension[];
  scoringRules?: SeedScoringRule[];
  resultRanges?: SeedResultRange[];

  /**
   * Questions authored directly for this assessment. Use `reuseQuestionKeys`
   * (below) instead when this assessment should reuse questions already
   * defined by another assessment in the seed set (e.g. the flagship
   * profile reusing Logical Reasoning's items) — the question library is
   * shared, so the same underlying `questions` row can be attached to
   * multiple assessments' `assessment_questions`.
   */
  questions?: SeedQuestion[];

  /**
   * References to questions owned by OTHER seed assessments, by their
   * `key`. Each entry places that question into one of this assessment's
   * own sections at the given order/weight — the underlying `questions`
   * row is not duplicated.
   */
  reuseQuestionKeys?: { questionKey: string; sectionKey: string; order: number; weight?: number }[];

  /** Which of this assessment's scoring dimensions feed the aggregate Brain Profile, and at what weight. */
  brainProfileContributions?: { sourceDimensionKey: string; targetBrainProfileDimensionKey: string; weight: number }[];
}

export interface SeedSection {
  key: string;
  name: string;
  description?: string;
  instructions?: string;
  timeLimitSeconds?: number | null;
  randomizeQuestions?: boolean;
  weight?: number;
  order: number;
}

export interface SeedScoringDimension {
  key: string;
  label: string;
  description?: string;
  contributesToBrainProfile: boolean;
  brainProfileDimensionKey?: string | null;
  order: number;
}

export interface SeedScoringRule {
  dimensionKey: string;
  formula: "sum" | "weighted_sum" | "average" | "weighted_average" | "custom";
  sectionWeights?: Record<string, number>;
  normalization?: { min: number; max: number };
  penaltyPerIncorrect?: number;
}

export interface SeedResultRange {
  dimensionKey: string;
  minScore: number;
  maxScore: number;
  title: string;
  description: string;
  recommendations?: string[];
  icon?: string;
  order: number;
}

export interface SeedQuestionOption {
  label: string;
  value: string;
  imageUrl?: string | null;
  isCorrect?: boolean;
  scoreConfig?: { dimensionKey: string; points: number }[];
}

export interface SeedQuestionMedia {
  type: "image" | "svg" | "audio";
  /** For images/svg: a URL or data URI (an inline SVG data URI needs no asset pipeline). For audio: either a real file URL, or `speech:<text>` to have the runner synthesize and play that text via the browser's Web Speech API (see QuestionMediaBlock.tsx). */
  url: string;
  alt?: string;
}

export interface SeedQuestion {
  /** Stable slug unique across the whole seed set (not just this assessment) — enables reuse via reuseQuestionKeys. */
  key: string;
  sectionKey: string;
  questionType: QuestionType;
  questionText: string;
  instructions?: string | null;
  /** Stimulus media shown above the question's answer UI — see SeedQuestionMedia. */
  media?: SeedQuestionMedia[];
  difficulty?: "easy" | "medium" | "hard" | null;
  category?: string | null;
  tags?: string[];
  timeLimitSeconds?: number | null;
  required?: boolean;
  order: number;
  weight?: number;
  options?: SeedQuestionOption[];
  /** Question-level scoring (used instead of per-option scoring for likert/numeric/etc). */
  scoreConfig?: { dimensionKey: string; points: number }[];
  correctAnswer?: unknown;
}
