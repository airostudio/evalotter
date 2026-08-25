import "server-only";
import { createClient } from "@/lib/supabase/server";
import { callClaudeForJSON, VISION_MODEL } from "./client";

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

const SYSTEM_PROMPT = `You provide palmistry readings for EvalOtter, framed explicitly as entertainment and self-reflection — never as a scientific, medical, or psychological analysis, and you must not claim otherwise anywhere in your response. Palmistry has no scientific validity; treat this as a creative, warm, personalised reading in the tradition of palm reading, grounded in what you can actually observe in the two photographs (line patterns, hand shape, finger proportions, visible markings) rather than generic boilerplate.

Use the person's context answers (dominant hand, what they're curious about, where they are in life, anything they asked to focus on) to shape the tone and focus of the reading, but do not fabricate having information you don't have.

Respond with ONLY a single JSON object, no prose before or after, matching exactly this shape:
{
  "handShape": string (1-2 sentences on the observed hand shape/proportions and its traditional palmistry meaning),
  "heartLine": string (1-2 sentences on the observed heart line and its traditional meaning),
  "headLine": string (1-2 sentences on the observed head line and its traditional meaning),
  "lifeLine": string (1-2 sentences on the observed life line and its traditional meaning),
  "fateLine": string (1-2 sentences, omit this key entirely if no fate line is clearly visible),
  "fingerProportions": string (1-2 sentences on finger length/proportions and their traditional meaning),
  "mounts": string (1-2 sentences on the visible palm mounts and their traditional meaning),
  "otherMarkers": string (1-2 sentences on any other notable markings, or a brief note if none stand out),
  "summary": string (2-3 sentence warm, personalised overall summary tying the reading together and lightly connecting to what the person said they're curious about)
}`;

/**
 * Vision-model palm analysis. Fetches the two stored (private) palm photos,
 * sends them to a vision-capable Claude model alongside the person's
 * context answers, and parses the structured reading. Returns a clearly
 * labelled placeholder if no provider is configured or the call fails —
 * this must never throw and block the rest of the (already-saved) flow.
 */
export async function interpretPalmistry(input: InterpretPalmistryInput): Promise<PalmistryAnalysis> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return placeholder("Analysis pending — connect an AI provider to enable palm reading.");
  }

  try {
    const supabase = await createClient();

    const [leftImage, rightImage] = await Promise.all([
      fetchImageAsBase64(supabase, input.leftMediaId),
      fetchImageAsBase64(supabase, input.rightMediaId),
    ]);

    return await callClaudeForJSON<PalmistryAnalysis>({
      model: VISION_MODEL,
      system: SYSTEM_PROMPT,
      maxTokens: 1200,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Context answers from the person:\n${JSON.stringify(input.contextAnswers, null, 2)}\n\nHere is their left palm, then their right palm:`,
            },
            { type: "image", source: { type: "base64", media_type: leftImage.mediaType, data: leftImage.base64 } },
            { type: "image", source: { type: "base64", media_type: rightImage.mediaType, data: rightImage.base64 } },
          ],
        },
      ],
    });
  } catch (err) {
    console.error("[ai/palmistry-vision] interpretation failed:", err);
    return placeholder(
      "We couldn't generate your reading right now. Your photos are saved — try again shortly, or contact support if this persists."
    );
  }
}

async function fetchImageAsBase64(
  supabase: Awaited<ReturnType<typeof createClient>>,
  mediaId: string
): Promise<{ base64: string; mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" }> {
  const { data: media, error: mediaError } = await supabase
    .from("uploaded_media")
    .select("storage_bucket, storage_path, mime_type")
    .eq("id", mediaId)
    .single();
  if (mediaError || !media) throw mediaError ?? new Error(`uploaded_media ${mediaId} not found`);

  const { data: blob, error: downloadError } = await supabase.storage
    .from(media.storage_bucket)
    .download(media.storage_path);
  if (downloadError || !blob) throw downloadError ?? new Error(`could not download ${media.storage_path}`);

  const buffer = Buffer.from(await blob.arrayBuffer());
  const mediaType = normalizeMediaType(media.mime_type);
  return { base64: buffer.toString("base64"), mediaType };
}

function normalizeMediaType(mime: string | null): "image/jpeg" | "image/png" | "image/webp" | "image/gif" {
  if (mime === "image/png" || mime === "image/webp" || mime === "image/gif") return mime;
  return "image/jpeg";
}

function placeholder(message: string): PalmistryAnalysis {
  return {
    handShape: message,
    heartLine: "—",
    headLine: "—",
    lifeLine: "—",
    fingerProportions: "—",
    mounts: "—",
    otherMarkers: "—",
    summary:
      "Palmistry readings on EvalOtter are offered for entertainment and self-reflection only, and carry no scientific validity claim.",
  };
}
