import { PalmistryCapture } from "@/components/assessment/PalmistryCapture";
import type { AssessmentEngineDefinition } from "../types";

/**
 * Palmistry and any future vision-based assessment. Deliberately has no
 * numeric scoringEngine output beyond a neutral placeholder — this engine
 * type never contributes to the Brain Profile (there should be no
 * brain_profile_contribution_rules row for assessments using it).
 */
export const visionAnalysisEngine: AssessmentEngineDefinition = {
  type: "vision_analysis",
  label: "Vision analysis",
  description: "Image-capture flow analysed by a vision-capable AI model (e.g. Palmistry).",
  validateAssessment() {
    return { valid: true, errors: [] };
  },
  renderer: PalmistryCapture,
  scoringEngine: async () => ({
    overallScore: 0,
    dimensions: [],
    metadata: { note: "vision_analysis assessments are interpretive, not scored." },
  }),
};
