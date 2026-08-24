import type { AssessmentEngineDefinition, RegisterAssessmentEngineInput } from "./types";

const registry = new Map<string, AssessmentEngineDefinition>();

/**
 * registerAssessmentEngine({ type, renderer, scoringEngine, resultRenderer })
 *
 * Call this once per engine (see `engines/*.ts`) to make a new assessment
 * kind available across the platform — the catalogue, runner and results
 * pages all resolve behaviour by `assessment.engineType` through this
 * registry, so adding a new engine never requires touching them.
 */
export function registerAssessmentEngine(definition: RegisterAssessmentEngineInput) {
  if (registry.has(definition.type)) {
    throw new Error(`Assessment engine "${definition.type}" is already registered.`);
  }
  registry.set(definition.type, definition);
}

export function getAssessmentEngine(type: string): AssessmentEngineDefinition {
  const engine = registry.get(type);
  if (!engine) {
    throw new Error(
      `No assessment engine registered for type "${type}". Registered types: ${[...registry.keys()].join(", ")}`
    );
  }
  return engine;
}

export function listAssessmentEngines(): AssessmentEngineDefinition[] {
  return [...registry.values()];
}

export function isAssessmentEngineRegistered(type: string): boolean {
  return registry.has(type);
}
