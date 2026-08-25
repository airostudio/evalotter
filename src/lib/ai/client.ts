import "server-only";
import Anthropic from "@anthropic-ai/sdk";

let cachedClient: Anthropic | null = null;

export function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  if (!cachedClient) cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}

export const INTERPRETATION_MODEL = "claude-sonnet-4-5";
export const VISION_MODEL = "claude-sonnet-4-5";

/**
 * Calls Claude with a prompt that must return exactly one JSON object, and
 * parses+returns it. Throws if the model is unavailable, errors, or its
 * response isn't valid JSON — callers are expected to catch and degrade
 * gracefully (never let an AI failure block a deterministic result the
 * user already earned).
 */
export async function callClaudeForJSON<T>(params: {
  system: string;
  messages: Anthropic.MessageParam[];
  maxTokens?: number;
  model?: string;
}): Promise<T> {
  const client = getAnthropicClient();
  if (!client) throw new Error("ANTHROPIC_API_KEY is not configured");

  const response = await client.messages.create({
    model: params.model ?? INTERPRETATION_MODEL,
    max_tokens: params.maxTokens ?? 1500,
    system: params.system,
    messages: params.messages,
  });

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
  if (!textBlock) throw new Error("Claude response contained no text block");

  const jsonText = extractJsonObject(textBlock.text);
  return JSON.parse(jsonText) as T;
}

/** Models sometimes wrap JSON in prose or a markdown fence despite instructions — pull out the first {...} object. */
function extractJsonObject(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1]! : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in Claude response");
  }
  return candidate.slice(start, end + 1);
}
