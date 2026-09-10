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

/**
 * Whether a user currently has Driftwater (the sleep add-on).
 *
 * "Currently" is doing real work here. A subscription row lingers after
 * cancellation — Stripe keeps serving until the period ends, and the row
 * keeps its status until a webhook says otherwise — so status alone is not
 * enough. A `trialing` or `active` row still has to be inside its period.
 *
 * current_period_end is treated as open-ended when null: Stripe always
 * sends one, so a null means we have not yet recorded it rather than that
 * access has lapsed, and failing open for a paying customer beats locking
 * one out over a missing webhook.
 */
export async function hasSleepAccess(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", userId)
    .in("plan", ["sleep_monthly", "sleep_annual"])
    .in("status", ["active", "trialing"])
    .order("current_period_end", { ascending: false, nullsFirst: true })
    .limit(1)
    .maybeSingle();

  if (!data) return false;
  if (!data.current_period_end) return true;
  return new Date(data.current_period_end).getTime() > Date.now();
}

/** The live sleep subscription row, for showing renewal/trial state. */
export async function getSleepSubscription(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end, stripe_subscription_id, created_at")
    .eq("user_id", userId)
    .in("plan", ["sleep_monthly", "sleep_annual"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}
