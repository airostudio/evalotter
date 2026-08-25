import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LockedOverlay } from "./LockedOverlay";

interface PalmistrySubmissionRow {
  id: string;
  left_palm_media_id: string | null;
  right_palm_media_id: string | null;
  analysis: Record<string, string> | null;
  status: string;
  created_at: string;
}

const ANALYSIS_FIELDS: { key: string; label: string }[] = [
  { key: "handShape", label: "Hand shape" },
  { key: "heartLine", label: "Heart line" },
  { key: "headLine", label: "Head line" },
  { key: "lifeLine", label: "Life line" },
  { key: "fateLine", label: "Fate line" },
  { key: "fingerProportions", label: "Finger proportions" },
  { key: "mounts", label: "Palm mounts" },
  { key: "otherMarkers", label: "Other markers" },
];

export async function PalmistryResult({
  submission,
  assessmentTitle,
  unlocked,
}: {
  submission: PalmistrySubmissionRow | null;
  assessmentTitle: string;
  unlocked: boolean;
}) {
  if (!submission) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-paper-100/60">
        We couldn&apos;t find a Palmistry reading for this attempt.
      </div>
    );
  }

  const supabase = await createClient();
  const [leftUrl, rightUrl] = await Promise.all([
    signedUrlFor(supabase, submission.left_palm_media_id),
    signedUrlFor(supabase, submission.right_palm_media_id),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <span className="text-xs uppercase tracking-widest text-signal-cyan/80">{assessmentTitle}</span>
      <h1 className="mt-2 font-display text-3xl text-paper-100 sm:text-4xl">Your reading</h1>

      <div className="mt-4 flex gap-3 rounded-xl2 border border-ink-600 bg-ink-800/40 p-4 text-sm text-paper-100/60">
        <ShieldCheck className="h-5 w-5 shrink-0 text-signal-cyan" />
        <p>For entertainment and self-reflection only — not a scientific or clinical analysis.</p>
      </div>

      {(() => {
        const reading = (
          <>
            <div className="mt-8 flex justify-center gap-4">
              {leftUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={leftUrl} alt="Left palm" className="h-40 w-40 rounded-xl2 border border-ink-600 object-cover" />
              )}
              {rightUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={rightUrl} alt="Right palm" className="h-40 w-40 rounded-xl2 border border-ink-600 object-cover" />
              )}
            </div>

            {submission.status !== "analyzed" ? (
              <p className="mt-10 text-center text-paper-100/60">Your reading is still being prepared.</p>
            ) : (
              <div className="mt-10 flex flex-col gap-4">
                {submission.analysis?.summary && (
                  <p className="rounded-xl2 border border-ink-700 bg-ink-800/30 p-5 text-sm leading-relaxed text-paper-100/80">
                    {submission.analysis.summary}
                  </p>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {ANALYSIS_FIELDS.map((field) => {
                    const value = submission.analysis?.[field.key];
                    if (!value) return null;
                    return (
                      <div key={field.key} className="rounded-xl2 border border-ink-700 bg-ink-800/30 p-4">
                        <p className="text-xs uppercase tracking-wide text-paper-100/40">{field.label}</p>
                        <p className="mt-1.5 text-sm text-paper-100/85">{value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        );

        return unlocked ? reading : <LockedOverlay label="Unlock your reading">{reading}</LockedOverlay>;
      })()}
    </div>
  );
}

async function signedUrlFor(
  supabase: Awaited<ReturnType<typeof createClient>>,
  mediaId: string | null
): Promise<string | null> {
  if (!mediaId) return null;
  const { data: media } = await supabase
    .from("uploaded_media")
    .select("storage_bucket, storage_path")
    .eq("id", mediaId)
    .maybeSingle();
  if (!media) return null;

  const { data } = await supabase.storage
    .from(media.storage_bucket)
    .createSignedUrl(media.storage_path, 60 * 10);

  return data?.signedUrl ?? null;
}
