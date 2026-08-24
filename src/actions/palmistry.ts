"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/current-user";
import { interpretPalmistry } from "@/lib/ai/palmistry-vision";

/**
 * Stores both palm photos privately (palmistry/{userId}/...), records the
 * submission, runs the (vision-model-ready) analysis stub, and marks the
 * attempt complete. No deterministic "score" applies here — Palmistry is
 * explicitly entertainment/self-reflection and never feeds the EvalOtter
 * cognitive score (see brain_profile_contribution_rules, which has no row
 * for this assessment).
 */
export async function submitPalmistryAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const attemptId = String(formData.get("attemptId"));
  const left = formData.get("left") as File;
  const right = formData.get("right") as File;
  const contextAnswers = JSON.parse(String(formData.get("contextAnswers") ?? "{}"));

  const [leftMediaId, rightMediaId] = await Promise.all([
    uploadPalmImage(user.id, left, "palmistry_left"),
    uploadPalmImage(user.id, right, "palmistry_right"),
  ]);

  const { data: submission, error } = await supabase
    .from("palmistry_submissions")
    .insert({
      user_id: user.id,
      attempt_id: attemptId,
      left_palm_media_id: leftMediaId,
      right_palm_media_id: rightMediaId,
      context_answers: contextAnswers,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !submission) throw error ?? new Error("Could not save submission");

  const analysis = await interpretPalmistry({ leftMediaId, rightMediaId, contextAnswers });

  await supabase
    .from("palmistry_submissions")
    .update({ analysis, status: "analyzed" })
    .eq("id", submission.id);

  await supabase
    .from("assessment_attempts")
    .update({ status: "completed", progress_percent: 100, completed_at: new Date().toISOString() })
    .eq("id", attemptId)
    .eq("user_id", user.id);

  redirect(`/results/${attemptId}?palmistry=${submission.id}`);
}

async function uploadPalmImage(userId: string, file: File, purpose: string): Promise<string> {
  const supabase = await createClient();
  const path = `${userId}/${purpose}-${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage.from("palmistry").upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data: media, error } = await supabase
    .from("uploaded_media")
    .insert({
      user_id: userId,
      storage_bucket: "palmistry",
      storage_path: path,
      mime_type: file.type,
      purpose,
    })
    .select("id")
    .single();

  if (error || !media) throw error ?? new Error("Could not record upload");
  return media.id;
}

/** Lets a user delete a previously uploaded palm image, per privacy requirements. */
export async function deletePalmImageAction(mediaId: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: media } = await supabase
    .from("uploaded_media")
    .select("storage_bucket, storage_path, user_id")
    .eq("id", mediaId)
    .single();

  if (!media || media.user_id !== user.id) throw new Error("Not found");

  await supabase.storage.from(media.storage_bucket).remove([media.storage_path]);
  await supabase.from("uploaded_media").delete().eq("id", mediaId);
}
