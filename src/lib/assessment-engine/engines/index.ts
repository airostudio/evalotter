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
} from "./standard-questionnaire";
import { visionAnalysisEngine } from "./vision-analysis";
import { compositeReportEngine } from "./composite-report";

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
    compositeReportEngine,
    visionAnalysisEngine,
  ];

  for (const engine of engines) {
    if (!isAssessmentEngineRegistered(engine.type)) {
      registerAssessmentEngine(engine);
    }
  }
}
