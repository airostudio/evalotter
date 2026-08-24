import "server-only";

export interface PalmistryAnalysis {
  handShape: string;
  heartLine: string;
  headLine: string;
  lifeLine: string;
  fateLine?: string;
  fingerProportions: string;
  mounts: string;
  otherMarkers: string;
  summary: string;
}

interface InterpretPalmistryInput {
  leftMediaId: string;
  rightMediaId: string;
  contextAnswers: Record<string, unknown>;
}

/**
 * Vision-model-ready hook for palm analysis. When OPENAI_API_KEY or
 * ANTHROPIC_API_KEY is configured, this should fetch signed URLs for the
 * two stored images and call a vision-capable model with a structured
 * prompt requesting exactly the PalmistryAnalysis shape. Until keys are
 * configured it returns a clearly-labelled placeholder so the rest of the
 * flow (storage, consent, results) is fully testable end to end.
 */
export async function interpretPalmistry(_input: InterpretPalmistryInput): Promise<PalmistryAnalysis> {
  const hasProvider = Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);

  // TODO once a provider key is configured: fetch signed URLs for
  // _input.leftMediaId / _input.rightMediaId via Supabase Storage, then
  // call the vision-capable model with a structured-output prompt matching
  // PalmistryAnalysis. Until then this returns a clearly-labelled
  // placeholder so the rest of the flow (storage, consent, results) is
  // fully testable end to end.
  return {
    handShape: hasProvider
      ? "Vision analysis not yet wired up for this build."
      : "Analysis pending — connect an AI provider to enable palm reading.",
    heartLine: "—",
    headLine: "—",
    lifeLine: "—",
    fingerProportions: "—",
    mounts: "—",
    otherMarkers: "—",
    summary:
      "Configure OPENAI_API_KEY or ANTHROPIC_API_KEY to enable AI-generated palmistry readings. This is entertainment content, not a scientific analysis.",
  };
}
