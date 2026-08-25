import "server-only";
import type { AssessmentResponse, AssessmentWithVersion, ScoringOutput } from "@/types";
import { callClaudeForJSON } from "./client";

export interface StructuredScoreInput {
  assessment: string;
  scores: Record<string, number>;
  overall: number;
  overallRange?: string;
  openEndedResponses?: { prompt: string; response: string }[];
}

export interface AIInterpretationDraft {
  summary: string;
  strengths: string[];
  developmentAreas: string[];
  behaviouralInterpretation: string;
  recommendations: string[];
  suggestedNextAssessmentSlug: string | null;
}

const SYSTEM_PROMPT = `You interpret already-computed assessment scores for EvalOtter, an education/entertainment/self-discovery platform. You NEVER see raw responses for closed-form questions and you NEVER alter, second-guess, or imply a different score than the one given — scoring is deterministic and finished before you're called. Your job is purely to write a personalised, encouraging, specific interpretation of the numbers (and, when present, open-ended written answers) already provided.

Rules:
- Do not make medical, clinical, or psychological diagnostic claims. This is not a clinical assessment.
- Be specific to the actual scores and any open-ended text given — avoid generic filler that could apply to any result.
- Keep tone warm, direct, and respectful of the user's intelligence — not saccharine, not clinical.
- suggestedNextAssessmentSlug must be one of exactly these slugs, or null: intelligence-profile, logical-reasoning, memory-recall, verbal-reasoning, verbal-intelligence, emotional-intelligence, metrics, spatial-intelligence, creative-assessment, palmistry. Pick one that complements this result (e.g. a low spatial score might suggest logical-reasoning) or null if none is a clear fit.
- Respond with ONLY a single JSON object, no prose before or after, matching exactly this shape:
{
  "summary": string (2-3 sentences),
  "strengths": string[] (1-4 short items, omit if none stand out),
  "developmentAreas": string[] (1-4 short items, omit if none stand out),
  "behaviouralInterpretation": string (1 paragraph on what this pattern of scores suggests about how the person approaches this domain day to day),
  "recommendations": string[] (2-4 concrete, actionable suggestions),
  "suggestedNextAssessmentSlug": string | null
}`;

/**
 * AI interpretation layer. Runs strictly AFTER deterministic scoring — it
 * receives already-computed scores (plus any open-ended text answers) and
 * never influences them. Returns null (never throws to the caller) if no
 * provider is configured or the call fails, so a missing/broken AI
 * integration never blocks a user from seeing their deterministic result.
 */
export async function generateInterpretation(
  assessment: AssessmentWithVersion,
  scoring: ScoringOutput,
  responses: AssessmentResponse[]
): Promise<AIInterpretationDraft | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const openEndedResponses = collectOpenEndedResponses(assessment, responses);

  const structuredInput: StructuredScoreInput = {
    assessment: assessment.title,
    scores: Object.fromEntries(scoring.dimensions.map((d) => [d.label, Math.round(d.score)])),
    overall: Math.round(scoring.overallScore),
    overallRange: scoring.overallRange?.title,
    openEndedResponses: openEndedResponses.length > 0 ? openEndedResponses : undefined,
  };

  try {
    return await callClaudeForJSON<AIInterpretationDraft>({
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Assessment: ${assessment.title}\n${assessment.longDescription}\n\nStructured result data:\n${JSON.stringify(structuredInput, null, 2)}`,
        },
      ],
    });
  } catch (err) {
    console.error(`[ai/interpretation] failed for assessment "${assessment.slug}":`, err);
    return null;
  }
}

function collectOpenEndedResponses(
  assessment: AssessmentWithVersion,
  responses: AssessmentResponse[]
): { prompt: string; response: string }[] {
  const out: { prompt: string; response: string }[] = [];
  for (const response of responses) {
    const aq = assessment.version.questions.find((q) => q.questionId === response.questionId);
    if (!aq) continue;
    const answer = response.answer;
    if (answer.type === "open_creative" || answer.type === "long_text") {
      if (answer.value.trim()) out.push({ prompt: aq.question.questionText, response: answer.value });
    }
  }
  return out;
}
