"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/current-user";

/** Users control visibility explicitly — results are private by default. */
export async function setResultShareAction(resultId: string, isPublic: boolean) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("assessment_results")
    .update({ is_public_share: isPublic })
    .eq("id", resultId)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath(`/results`);
}

export async function deleteResultAction(resultId: string, attemptId: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("assessment_results")
    .delete()
    .eq("id", resultId)
    .eq("user_id", user.id);

  if (error) throw error;

  await supabase.from("assessment_attempts").delete().eq("id", attemptId).eq("user_id", user.id);
  revalidatePath("/dashboard");
}
