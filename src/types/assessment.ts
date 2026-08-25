import type { AssessmentQuestion } from "./question";
import type { ResultRange, ScoringDimension, ScoringRule } from "./scoring";

export type AssessmentEngineType =
  | "standard_questionnaire"
  | "timed_questionnaire"
  | "cognitive_game"
  | "memory_exercise"
  | "pattern_recognition"
  | "image_based"
  | "ai_analysis"
  | "vision_analysis"
  | "hybrid"
  | "custom_interactive";

export type AssessmentStatus = "draft" | "review" | "published" | "archived" | "coming_soon";

export type AssessmentAccess = "free" | "premium";

export interface AssessmentCategory {
  id: string;
  key: string;
  label: string;
  description?: string | null;
  icon?: string | null;
  order: number;
}

export interface Assessment {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  icon: string;
  coverImageUrl?: string | null;
  categoryId: string;
  category?: AssessmentCategory;
  engineType: AssessmentEngineType;
  difficulty: "easy" | "medium" | "hard";
  estimatedDurationMinutes: number;
  questionCount: number;
  featured: boolean;
  access: AssessmentAccess;
  status: AssessmentStatus;
  currentVersionId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentSection {
  id: string;
  assessmentVersionId: string;
  name: string;
  description?: string | null;
  instructions?: string | null;
  timeLimitSeconds?: number | null;
  randomizeQuestions: boolean;
  questionCount?: number | null;
  weight: number;
  order: number;
}

/**
 * A published, immutable snapshot of an assessment's structure and scoring.
 * Attempts are always tied to a specific version so editing a live
 * assessment never corrupts historical results.
 */
export interface AssessmentVersion {
  id: string;
  assessmentId: string;
  versionNumber: number;
  status: AssessmentStatus;
  publishedAt?: string | null;
  sections: AssessmentSection[];
  questions: AssessmentQuestion[];
  scoringDimensions: ScoringDimension[];
  scoringRules: ScoringRule[];
  resultRanges: ResultRange[];
  settings: AssessmentRunnerSettings;
}

export interface AssessmentRunnerSettings {
  allowBackNavigation: boolean;
  randomizeSections: boolean;
  randomizeQuestions: boolean;
  randomizeAnswerOrder: boolean;
  showProgressBar: boolean;
  showInstructionsBetweenSections: boolean;
  autosaveIntervalSeconds: number;
  totalTimeLimitSeconds?: number | null;
}

export interface AssessmentWithVersion extends Assessment {
  version: AssessmentVersion;
}
