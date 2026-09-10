import "server-only";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Mirrors a Stripe subscription into the `subscriptions` table.
 *
 * Stripe is the source of truth for billing; this row exists so the app can
 * answer "does this user have Driftwater right now" without a round trip on
 * every page load. It is written from webhook events only.
 *
 * Idempotent on stripe_subscription_id (unique index added in 0014), so a
 * webhook retry — or the same event arriving twice, which Stripe explicitly
 * allows — updates the existing row instead of creating a duplicate.
 */
const STATUS_MAP: Record<string, string> = {
  trialing: "trialing",
  active: "active",
  past_due: "past_due",
  canceled: "canceled",
  unpaid: "past_due",
  incomplete: "incomplete",
  incomplete_expired: "canceled",
  paused: "canceled",
};

export async function recordSubscriptionFromStripe(subscription: Stripe.Subscription): Promise<void> {
  const meta = subscription.metadata ?? {};
  const userId = meta.userId;
  const plan = meta.plan;

  // Not one of ours — the platform also sells one-off unlocks, and a
  // subscription without our metadata is not something we can attribute.
  if (!userId || (plan !== "sleep_monthly" && plan !== "sleep_annual")) return;

  const status = STATUS_MAP[subscription.status] ?? "incomplete";
  const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;

  const db = createAdminClient();
  const { data: existing } = await db
    .from("subscriptions")
    .select("id")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();

  const row = {
    user_id: userId,
    plan,
    status,
    stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : null,
    stripe_subscription_id: subscription.id,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = existing
    ? await db.from("subscriptions").update(row).eq("id", existing.id)
    : await db.from("subscriptions").insert(row);

  if (error) console.error("[record-subscription] write failed:", error.message);
}
