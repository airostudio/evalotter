import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isAdminRole } from "@/lib/auth/roles";
import type { UserRole } from "@/types";

/**
 * Admins hold every entitlement without paying.
 *
 * They need to see exactly what a customer sees — a real score, a real
 * dimension breakdown, a real AI interpretation — to check the product is
 * behaving. Buying each report to do that is absurd, and the alternative
 * people reach for otherwise is comping themselves a purchase, which puts
 * fake rows in the revenue ledger.
 *
 * Nothing is written anywhere: this grants a view, never a purchase, so
 * /admin/financials keeps reporting real money only.
 *
 * Read through whichever client the caller passed. RLS lets a user read
 * their own profile, so this works on a user-scoped client; the admin
 * pages pass the service-role client and it works there too.
 */
async function isAdminUser(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  return isAdminRole(data?.role as UserRole | undefined);
}

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
  if (await isAdminUser(supabase, userId)) return true;

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
 * view. Admins always pass — see isAdminUser.
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
