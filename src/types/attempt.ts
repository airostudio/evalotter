import type { AnswerValue } from "./question";

export type AttemptStatus = "in_progress" | "completed" | "abandoned";

export interface AssessmentAttempt {
  id: string;
  userId: string;
  assessmentId: string;
  assessmentVersionId: string;
  status: AttemptStatus;
  currentSectionId?: string | null;
  currentQuestionId?: string | null;
  progressPercent: number;
  startedAt: string;
  lastActivityAt: string;
  completedAt?: string | null;
  sectionOrder?: string[] | null;
  questionOrder?: Record<string, string[]> | null;
  totalTimeMs?: number | null;
}

export interface AssessmentResponse {
  id: string;
  attemptId: string;
  questionId: string;
  sectionId: string;
  answer: AnswerValue;
  isCorrect?: boolean | null;
  responseTimeMs?: number | null;
  answeredAt: string;
}
