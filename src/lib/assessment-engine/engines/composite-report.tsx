import { AssessmentRunner } from "@/components/assessment/AssessmentRunner";
import { createClient } from "@/lib/supabase/server";
import type { AssessmentEngineDefinition } from "../types";
import type { ScoringOutput } from "@/types";

/** The four Brain Profile axes that map to cognitive ability in the traditional sense — Emotional and Creative are deliberately excluded from a composite framed as an IQ estimate, the same way Palmistry is excluded from the Brain Profile aggregate itself. */
const CORE_DIMENSIONS = ["logical", "verbal", "spatial", "memory"] as const;
const MIN_DIMENSIONS_REQUIRED = 3;

/**
 * The only engine on the platform whose scoring doesn't come from the
 * attempt's own responses — Full IQ Estimation Report has a single
 * acknowledgment question, and its real "score" is a composite drawn from
 * the user's other completed assessments' Brain Profile dimensions. If
 * they haven't completed enough of those yet, this returns the sentinel
 * score 0 with a result range explicitly labeled "not enough data" rather
 * than presenting a fabricated result from sparse or absent data.
 */
export const compositeReportEngine: AssessmentEngineDefinition = {
  type: "ai_analysis",
  label: "Composite report",
  description: "Reads a user's other completed assessment results and computes a composite — not scored from its own questions.",
  validateAssessment(assessment) {
    const errors: string[] = [];
    if (assessment.version.sections.length === 0) errors.push("Assessment has no sections.");
    if (assessment.version.questions.length === 0) errors.push("Assessment has no questions.");
    return { valid: errors.length === 0, errors };
  },
  renderer: AssessmentRunner,
  scoringEngine: async (assessment, attempt): Promise<ScoringOutput> => {
    const supabase = await createClient();
    const { data: dims } = await supabase
      .from("brain_profile_dimensions")
      .select("dimension_key, score")
      .eq("user_id", attempt.userId);

    const covered = (dims ?? []).filter(
      (d): d is { dimension_key: string; score: number } =>
        CORE_DIMENSIONS.includes(d.dimension_key as (typeof CORE_DIMENSIONS)[number]) && d.score != null
    );

    const dimensionMeta = assessment.version.scoringDimensions[0];
    const resultRanges = assessment.version.resultRanges;
    const dimensionKey = dimensionMeta?.key ?? "iq-composite";
    const dimensionLabel = dimensionMeta?.label ?? "Composite Estimate";

    if (covered.length < MIN_DIMENSIONS_REQUIRED) {
      // Sentinel: exactly 0, landing in the dedicated "not enough data"
      // result range (0-5) rather than the lowest genuine performance tier
      // (6-30) — those must never be confused with each other.
      return {
        overallScore: 0,
        overallRange: resultRanges.find((r) => r.dimensionKey === "overall" && 0 >= r.minScore && 0 <= r.maxScore),
        dimensions: [
          {
            dimensionKey,
            label: dimensionLabel,
            rawScore: 0,
            score: 0,
            range: resultRanges.find((r) => r.dimensionKey === dimensionKey && 0 >= r.minScore && 0 <= r.maxScore),
          },
        ],
      };
    }

    const composite = covered.reduce((sum, d) => sum + Number(d.score), 0) / covered.length;
    const clamped = Math.max(0, Math.min(100, composite));

    return {
      overallScore: clamped,
      overallRange: resultRanges.find((r) => r.dimensionKey === "overall" && clamped >= r.minScore && clamped <= r.maxScore),
      dimensions: [
        {
          dimensionKey,
          label: dimensionLabel,
          rawScore: composite,
          score: clamped,
          range: resultRanges.find((r) => r.dimensionKey === dimensionKey && clamped >= r.minScore && clamped <= r.maxScore),
        },
      ],
    };
  },
};
