import { AssessmentRunner } from "@/components/assessment/AssessmentRunner";
import { computeScoring } from "@/lib/scoring/engine";
import type { AssessmentEngineDefinition } from "../types";

/**
 * Shared implementation behind every question-and-answer style engine
 * (standard, timed, memory, pattern-recognition, image-based, hybrid).
 * Behavioural differences between these live in the assessment version's
 * `settings` and section config (time limits, randomization), not in
 * separate code paths — so a new "kind" of questionnaire only needs a new
 * registration, not new UI.
 */
function makeQuestionnaireEngine(
  type: string,
  label: string,
  description: string
): AssessmentEngineDefinition {
  return {
    type,
    label,
    description,
    validateAssessment(assessment) {
      const errors: string[] = [];
      if (assessment.version.sections.length === 0) errors.push("Assessment has no sections.");
      if (assessment.version.questions.length === 0) errors.push("Assessment has no questions.");
      return { valid: errors.length === 0, errors };
    },
    renderer: AssessmentRunner,
    scoringEngine: (assessment, _attempt, responses) => computeScoring(assessment, responses),
  };
}

export const standardQuestionnaireEngine = makeQuestionnaireEngine(
  "standard_questionnaire",
  "Standard questionnaire",
  "Sequential multi-section question set with deterministic scoring."
);

export const timedQuestionnaireEngine = makeQuestionnaireEngine(
  "timed_questionnaire",
  "Timed questionnaire",
  "Standard questionnaire with section- or question-level time limits."
);

export const cognitiveGameEngine = makeQuestionnaireEngine(
  "cognitive_game",
  "Cognitive game",
  "Interactive, game-like cognitive exercise using the standard question set."
);

export const memoryExerciseEngine = makeQuestionnaireEngine(
  "memory_exercise",
  "Memory exercise",
  "Study/recall flow (word lists, sequences) using memory_recall questions."
);

export const patternRecognitionEngine = makeQuestionnaireEngine(
  "pattern_recognition",
  "Pattern recognition",
  "Visual/logical pattern-completion questions."
);

export const imageBasedEngine = makeQuestionnaireEngine(
  "image_based",
  "Image-based assessment",
  "Assessment driven primarily by image_choice/visual_rotation questions."
);

export const hybridEngine = makeQuestionnaireEngine(
  "hybrid",
  "Hybrid assessment",
  "Combines multiple question types and dimensions in one flow."
);

export const customInteractiveEngine = makeQuestionnaireEngine(
  "custom_interactive",
  "Custom interactive module",
  "Falls back to the standard runner; register a bespoke renderer for fully custom UI."
);

export const aiAnalysisEngine = makeQuestionnaireEngine(
  "ai_analysis",
  "AI analysis",
  "Standard question set whose results lean heavily on AI interpretation (open-ended responses)."
);
