export type QuestionType =
  | "multiple_choice"
  | "multiple_select"
  | "true_false"
  | "rating_scale"
  | "likert_scale"
  | "slider"
  | "numeric_input"
  | "text_input"
  | "long_text"
  | "image_choice"
  | "image_upload"
  | "sequence"
  | "drag_drop"
  | "matching"
  | "timed_choice"
  | "memory_recall"
  | "pattern_question"
  | "visual_rotation"
  | "open_creative"
  | "custom_interactive";

export interface QuestionOption {
  id: string;
  questionId: string;
  label: string;
  value: string;
  imageUrl?: string | null;
  isCorrect?: boolean | null;
  order: number;
  scoreConfig?: ScoreImpact[] | null;
}

/** A single option/answer's effect on one or more scoring dimensions. */
export interface ScoreImpact {
  dimensionKey: string;
  points: number;
}

export interface QuestionMedia {
  type: "image" | "svg" | "audio";
  url: string;
  alt?: string;
}

export interface Question {
  id: string;
  questionType: QuestionType;
  questionText: string;
  instructions?: string | null;
  media?: QuestionMedia[] | null;
  options?: QuestionOption[] | null;
  correctAnswer?: unknown;
  scoreConfig?: ScoreImpact[] | null;
  difficulty?: "easy" | "medium" | "hard" | null;
  category?: string | null;
  tags?: string[] | null;
  timeLimitSeconds?: number | null;
  required: boolean;
  createdAt: string;
  updatedAt: string;
}

/** The join between a question and a specific assessment section/version, with ordering. */
export interface AssessmentQuestion {
  id: string;
  assessmentVersionId: string;
  sectionId: string;
  questionId: string;
  question: Question;
  order: number;
  weight: number;
  conditional?: QuestionCondition | null;
}

export interface QuestionCondition {
  dependsOnQuestionId: string;
  operator: "equals" | "not_equals" | "includes" | "greater_than" | "less_than";
  value: unknown;
}

/** The value shape a runner stores for a given answered question, per type. */
export type AnswerValue =
  | { type: "multiple_choice"; optionId: string }
  | { type: "multiple_select"; optionIds: string[] }
  | { type: "true_false"; value: boolean }
  | { type: "rating_scale"; value: number }
  | { type: "likert_scale"; value: number }
  | { type: "slider"; value: number }
  | { type: "numeric_input"; value: number }
  | { type: "text_input"; value: string }
  | { type: "long_text"; value: string }
  | { type: "image_choice"; optionId: string }
  | { type: "image_upload"; mediaId: string }
  | { type: "sequence"; order: string[] }
  | { type: "drag_drop"; placements: Record<string, string> }
  | { type: "matching"; pairs: Record<string, string> }
  | { type: "timed_choice"; optionId: string; responseTimeMs: number }
  | { type: "memory_recall"; recalled: string[] }
  | { type: "pattern_question"; optionId: string }
  | { type: "visual_rotation"; optionId: string }
  | { type: "open_creative"; value: string }
  | { type: "custom_interactive"; payload: Record<string, unknown> };
