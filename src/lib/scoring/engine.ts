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
  options: { id: string; scoreConfig?: ScoreImpact[] | null }[]
): ScoreImpact[] {
  const impacts: ScoreImpact[] = [...(questionScoreConfig ?? [])];

  const answer = response.answer;
  if (answer.type === "multiple_choice" || answer.type === "image_choice" || answer.type === "pattern_question" || answer.type === "visual_rotation") {
    const opt = options.find((o) => o.id === answer.optionId);
    if (opt?.scoreConfig) impacts.push(...opt.scoreConfig);
  }
  if (answer.type === "multiple_select") {
    for (const optionId of answer.optionIds) {
      const opt = options.find((o) => o.id === optionId);
      if (opt?.scoreConfig) impacts.push(...opt.scoreConfig);
    }
  }

  return impacts;
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
