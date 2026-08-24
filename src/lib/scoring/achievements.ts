import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Evaluates achievement conditions for a user after a completed attempt.
 * Kept intentionally simple/deterministic (count-based), matching the
 * "restrained, not childish" gamification direction — no points spam.
 */
export async function maybeGrantAchievements(userId: string) {
  const supabase = await createClient();

  const { count: completedCount } = await supabase
    .from("assessment_results")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const { data: profile } = await supabase
    .from("user_brain_profiles")
    .select("assessments_completed, assessments_total")
    .eq("user_id", userId)
    .maybeSingle();

  const keysToGrant: string[] = [];

  if ((completedCount ?? 0) >= 1) keysToGrant.push("first_assessment");

  if (profile?.assessments_total) {
    const pct = (profile.assessments_completed / profile.assessments_total) * 100;
    if (pct >= 50) keysToGrant.push("profile_halfway");
    if (pct >= 100) keysToGrant.push("profile_complete");
  }

  if (keysToGrant.length === 0) return;

  const { data: achievements } = await supabase
    .from("achievements")
    .select("id, key")
    .in("key", keysToGrant);

  if (!achievements || achievements.length === 0) return;

  await supabase
    .from("user_achievements")
    .upsert(
      achievements.map((a) => ({ user_id: userId, achievement_id: a.id })),
      { onConflict: "user_id,achievement_id", ignoreDuplicates: true }
    );
}
