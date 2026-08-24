import type { ComponentType } from "react";
import type {
  AssessmentAttempt,
  AssessmentResponse,
  AssessmentWithVersion,
  ScoringOutput,
} from "@/types";

/** Props every assessment runner (renderer) receives. */
export interface AssessmentRendererProps {
  assessment: AssessmentWithVersion;
  attempt: AssessmentAttempt;
  responses: AssessmentResponse[];
}

/** Props every custom result renderer receives, alongside the standard results UI. */
export interface AssessmentResultRendererProps {
  assessment: AssessmentWithVersion;
  attempt: AssessmentAttempt;
  responses: AssessmentResponse[];
  scoring: ScoringOutput;
}

export type ScoringEngineFn = (
  assessment: AssessmentWithVersion,
  attempt: AssessmentAttempt,
  responses: AssessmentResponse[]
) => ScoringOutput | Promise<ScoringOutput>;

/**
 * A pluggable assessment engine. Each `Assessment.engineType` resolves to
 * exactly one of these via the registry. New assessment kinds (a new game,
 * a vision-based flow, a hybrid module) are added by registering a new
 * engine here — the catalogue, runner, and results pages never hard-code
 * assessment-specific logic.
 */
export interface AssessmentEngineDefinition {
  type: string;
  label: string;
  description: string;
  /** Validates that an assessment's structure is usable by this engine. */
  validateAssessment: (assessment: AssessmentWithVersion) => { valid: boolean; errors: string[] };
  /** Component that renders the live-taking experience. */
  renderer: ComponentType<AssessmentRendererProps>;
  /** Deterministic scoring function run once an attempt is submitted. */
  scoringEngine: ScoringEngineFn;
  /** Optional component rendered alongside the standard results UI for engine-specific visuals. */
  resultRenderer?: ComponentType<AssessmentResultRendererProps>;
}

export interface RegisterAssessmentEngineInput extends AssessmentEngineDefinition {}
