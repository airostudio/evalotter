import { registerAssessmentEngine, isAssessmentEngineRegistered } from "../registry";
import {
  standardQuestionnaireEngine,
  timedQuestionnaireEngine,
  cognitiveGameEngine,
  memoryExerciseEngine,
  patternRecognitionEngine,
  imageBasedEngine,
  hybridEngine,
  customInteractiveEngine,
  aiAnalysisEngine,
} from "./standard-questionnaire";
import { visionAnalysisEngine } from "./vision-analysis";

let bootstrapped = false;

/**
 * Registers every built-in assessment engine. Call once (e.g. from a
 * top-level layout or the first server action/page that needs the
 * registry) before resolving `assessment.engineType` anywhere.
 */
export function registerBuiltInAssessmentEngines() {
  if (bootstrapped) return;
  bootstrapped = true;

  const engines = [
    standardQuestionnaireEngine,
    timedQuestionnaireEngine,
    cognitiveGameEngine,
    memoryExerciseEngine,
    patternRecognitionEngine,
    imageBasedEngine,
    hybridEngine,
    customInteractiveEngine,
    aiAnalysisEngine,
    visionAnalysisEngine,
  ];

  for (const engine of engines) {
    if (!isAssessmentEngineRegistered(engine.type)) {
      registerAssessmentEngine(engine);
    }
  }
}
