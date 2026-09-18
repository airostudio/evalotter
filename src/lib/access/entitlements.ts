import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Whether a user has bought the one-off "full collection" unlock —
 * `subscriptions.plan = 'full_profile_one_off'` with no expiry, so this
 * table doubles as the lifetime-unlock ledger even though it was originally
 * modeled for recurring plans.
 */
export async function hasFullCollectionAccess(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("plan", "full_profile_one_off")
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  return !!data;
}

/**
 * Whether a user can see the full (unblurred) results for one assessment —
 * either they bought the full collection, or they bought this single
 * report. Free to *take* every assessment; this only gates the results
 * view.
 */
export async function hasReportAccess(
  supabase: SupabaseClient,
  userId: string,
  assessmentId: string
): Promise<boolean> {
  if (await hasFullCollectionAccess(supabase, userId)) return true;

  const { data } = await supabase
    .from("report_purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("assessment_id", assessmentId)
    .limit(1)
    .maybeSingle();

  return !!data;
}
