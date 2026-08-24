import type { ScoringOutput } from "./scoring";

export interface AssessmentResult {
  id: string;
  attemptId: string;
  assessmentId: string;
  assessmentVersionId: string;
  userId: string;
  scoring: ScoringOutput;
  isPublicShare: boolean;
  createdAt: string;
}

export type AIInterpretationStatus = "pending" | "completed" | "failed" | "skipped";

export interface AIInterpretation {
  id: string;
  resultId: string;
  status: AIInterpretationStatus;
  provider?: "openai" | "anthropic" | null;
  summary?: string | null;
  strengths?: string[] | null;
  developmentAreas?: string[] | null;
  behaviouralInterpretation?: string | null;
  recommendations?: string[] | null;
  suggestedNextAssessmentSlug?: string | null;
  rawResponse?: unknown;
  createdAt: string;
}
