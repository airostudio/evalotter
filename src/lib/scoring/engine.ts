import type {
  AssessmentResponse,
  AssessmentWithVersion,
  DimensionScore,
  ResultRange,
  ScoreImpact,
  ScoringOutput,
  ScoringRule,
} from "@/types";

/**
 * Generic deterministic scoring engine shared by every assessment engine
 * type. Given raw responses plus the version's scoring dimensions/rules/
 * result ranges, it produces normalized 0-100 scores per dimension and an
 * overall score. AI never influences this computation — it only interprets
 * the output afterwards (see src/lib/ai).
 */
export function computeScoring(
  assessment: AssessmentWithVersion,
  responses: AssessmentResponse[]
): ScoringOutput {
  const { version } = assessment;
  const dimensions = version.scoringDimensions;
  const rules = version.scoringRules;
  const resultRanges = version.resultRanges;

  const dimensionScores: DimensionScore[] = dimensions.map((dim) => {
    const rule = rules.find((r) => r.dimensionKey === dim.key);
    const raw = computeRawScoreForDimension(dim.key, responses, version.questions, rule);
    const normalized = normalize(raw, rule);
    const range = findRange(resultRanges, dim.key, normalized);
    return {
      dimensionKey: dim.key,
      label: dim.label,
      rawScore: raw,
      score: clamp(normalized, 0, 100),
      range,
    };
  });

  const overallScore = computeOverallScore(dimensionScores, rules);
  const overallRange = findRange(resultRanges, "overall", overallScore);

  return {
    overallScore: clamp(overallScore, 0, 100),
    overallRange,
    dimensions: dimensionScores,
  };
}

function computeRawScoreForDimension(
  dimensionKey: string,
  responses: AssessmentResponse[],
  questions: AssessmentWithVersion["version"]["questions"],
  rule?: ScoringRule
): number {
  let total = 0;
  let weightSum = 0;

  for (const response of responses) {
    const aq = questions.find((q) => q.questionId === response.questionId);
    if (!aq) continue;

    const impacts = collectImpacts(response, aq.question.scoreConfig, aq.question.options ?? []);
    const dimensionImpact = impacts
      .filter((i) => i.dimensionKey === dimensionKey)
      .reduce((sum, i) => sum + i.points, 0);

    if (dimensionImpact === 0) continue;

    const weight = aq.weight ?? 1;
    total += rule?.formula === "weighted_sum" || rule?.formula === "weighted_average"
      ? dimensionImpact * weight
      : dimensionImpact;
    weightSum += weight;

    if (rule?.penaltyPerIncorrect && response.isCorrect === false) {
      total -= rule.penaltyPerIncorrect;
    }
  }

  if (rule?.formula === "average" || rule?.formula === "weighted_average") {
    return weightSum > 0 ? total / weightSum : 0;
  }

  return total;
}

function collectImpacts(
  response: AssessmentResponse,
  questionScoreConfig: ScoreImpact[] | null | undefined,
  options: { id: string; value: string; scoreConfig?: ScoreImpact[] | null }[]
): ScoreImpact[] {
  const answer = response.answer;

  // Free recall: the question's options are the ground-truth item list
  // (each isCorrect:true, carrying its own scoreConfig) rather than
  // clickable choices — score by matching each typed entry against an
  // option's value, case-insensitively, crediting each matched option at
  // most once regardless of how many times it was (re)typed.
  if (answer.type === "memory_recall") {
    const recalledNormalized = new Set(answer.recalled.map((r) => r.trim().toLowerCase()));
    const impacts: ScoreImpact[] = [];
    for (const opt of options) {
      if (opt.scoreConfig && recalledNormalized.has(opt.value.trim().toLowerCase())) {
        impacts.push(...opt.scoreConfig);
      }
    }
    return impacts;
  }

  // Choice-based questions: points come entirely from the selected
  // option(s)' own scoreConfig — the question-level scoreConfig isn't used.
  if (
    answer.type === "multiple_choice" ||
    answer.type === "image_choice" ||
    answer.type === "pattern_question" ||
    answer.type === "visual_rotation" ||
    answer.type === "timed_choice"
  ) {
    const opt = options.find((o) => o.id === answer.optionId);
    return opt?.scoreConfig ? [...opt.scoreConfig] : [];
  }
  if (answer.type === "multiple_select") {
    const impacts: ScoreImpact[] = [];
    for (const optionId of answer.optionIds) {
      const opt = options.find((o) => o.id === optionId);
      if (opt?.scoreConfig) impacts.push(...opt.scoreConfig);
    }
    return impacts;
  }

  // Value-based questions (Likert self-report, rating scales, sliders,
  // numeric entry): the question's scoreConfig gives a per-unit weight per
  // dimension, and the actual answered value scales it — otherwise every
  // response would score identically regardless of what was selected.
  if (
    answer.type === "likert_scale" ||
    answer.type === "rating_scale" ||
    answer.type === "slider" ||
    answer.type === "numeric_input"
  ) {
    return (questionScoreConfig ?? []).map((impact) => ({
      dimensionKey: impact.dimensionKey,
      points: answer.value * impact.points,
    }));
  }

  if (answer.type === "true_false") {
    // scoreConfig on a true/false question represents the points for a
    // "true" answer; a "false" answer earns none. Questions that want the
    // reverse should encode it via the option-based multiple_choice type.
    return answer.value ? [...(questionScoreConfig ?? [])] : [];
  }

  // Open-ended / non-deterministic types (text, long_text, open_creative,
  // image_upload, etc.) never contribute to the deterministic score.
  return [];
}

function normalize(raw: number, rule?: ScoringRule): number {
  if (!rule?.normalization) return raw;
  const { min, max } = rule.normalization;
  if (max === min) return 0;
  return ((raw - min) / (max - min)) * 100;
}

function computeOverallScore(dimensions: DimensionScore[], rules: ScoringRule[]): number {
  if (dimensions.length === 0) return 0;

  const overallRule = rules.find((r) => r.dimensionKey === "overall");
  if (overallRule?.sectionWeights) {
    const weights = overallRule.sectionWeights;
    let total = 0;
    let weightSum = 0;
    for (const d of dimensions) {
      const w = weights[d.dimensionKey] ?? 1;
      total += d.score * w;
      weightSum += w;
    }
    return weightSum > 0 ? total / weightSum : 0;
  }

  return dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length;
}

function findRange(
  ranges: ResultRange[],
  dimensionKey: string,
  score: number
): ResultRange | undefined {
  return ranges.find(
    (r) => r.dimensionKey === dimensionKey && score >= r.minScore && score <= r.maxScore
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
