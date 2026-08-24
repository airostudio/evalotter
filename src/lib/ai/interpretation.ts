import "server-only";
import type { Assessment, ScoringOutput } from "@/types";

export interface StructuredScoreInput {
  assessment: string;
  scores: Record<string, number>;
}

export interface AIInterpretationDraft {
  summary: string;
  strengths: string[];
  developmentAreas: string[];
  behaviouralInterpretation: string;
  recommendations: string[];
  suggestedNextAssessmentSlug: string | null;
}

/**
 * AI interpretation layer. Runs strictly AFTER deterministic scoring —
 * it receives already-computed scores and never influences them. Flow:
 * responses -> scoring engine -> structured result data -> this function
 * -> personalised report (see src/types/result.ts AIInterpretation, and
 * assessment_results/result_dimensions vs ai_interpretations tables, which
 * are stored separately by design).
 */
export async function generateInterpretation(
  assessment: Assessment,
  scoring: ScoringOutput
): Promise<AIInterpretationDraft | null> {
  const hasProvider = Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);
  if (!hasProvider) return null;

  const structuredInput: StructuredScoreInput = {
    assessment: assessment.title,
    scores: Object.fromEntries(scoring.dimensions.map((d) => [d.dimensionKey, Math.round(d.score)])),
  };

  void structuredInput;

  // TODO: call the configured provider (OpenAI/Anthropic) with a prompt
  // that includes `structuredInput` plus assessment.longDescription and
  // each dimension's result_ranges.ai_prompt_fragment, requesting a
  // structured AIInterpretationDraft response. Persist the raw response
  // in ai_interpretations.raw_response for auditability.
  return null;
}
