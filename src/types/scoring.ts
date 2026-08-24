/**
 * A scoring dimension is a named axis an assessment measures, e.g. "logical",
 * "memory", "empathy". Assessments can define multiple dimensions; the
 * Brain Profile aggregates a configurable subset of these across assessments.
 */
export interface ScoringDimension {
  id: string;
  assessmentId: string;
  key: string;
  label: string;
  description?: string | null;
  /** Whether this dimension contributes to the aggregate Brain Profile radar. */
  contributesToBrainProfile: boolean;
  /** Optional brain-profile-level dimension this maps onto (e.g. many assessments -> "logical"). */
  brainProfileDimensionKey?: string | null;
  order: number;
}

export type ScoringFormula = "sum" | "weighted_sum" | "average" | "weighted_average" | "custom";

export interface ScoringRule {
  id: string;
  assessmentVersionId: string;
  dimensionKey: string;
  formula: ScoringFormula;
  /** For weighted formulas: section weights keyed by section id. */
  sectionWeights?: Record<string, number> | null;
  /** Points added per correct answer / time bonus config for timed sections. */
  timeBonus?: { thresholdSeconds: number; bonusPoints: number }[] | null;
  /** Penalty applied for incorrect answers, if any. */
  penaltyPerIncorrect?: number | null;
  /** Raw-score to 0-100 normalization bounds. */
  normalization?: { min: number; max: number } | null;
}

export interface ResultRange {
  id: string;
  assessmentId: string;
  dimensionKey: string; // "overall" for the composite score, or a specific dimension key
  minScore: number;
  maxScore: number;
  title: string;
  description: string;
  recommendations?: string[] | null;
  icon?: string | null;
  aiPromptFragment?: string | null;
  order: number;
}

export interface DimensionScore {
  dimensionKey: string;
  label: string;
  rawScore: number;
  score: number; // normalized 0-100
  percentile?: number | null;
  range?: ResultRange | null;
}

export interface ScoringOutput {
  overallScore: number;
  overallRange?: ResultRange | null;
  dimensions: DimensionScore[];
  metadata?: Record<string, unknown>;
}
