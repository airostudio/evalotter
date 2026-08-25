import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

/**
 * Checkout session metadata set by the checkout route (`/api/stripe/checkout`)
 * and read back here — by the webhook (source of truth) and by the
 * redirect-confirm fallback (instant UX, since webhooks can lag a few
 * seconds in practice). Both call this with the same session, so it must be
 * idempotent — enforced by the unique constraints on
 * `stripe_payment_intent_id` added in migration 0009.
 */
export async function recordPurchaseFromSession(session: Stripe.Checkout.Session): Promise<void> {
  if (session.payment_status !== "paid") return;

  const userId = session.metadata?.userId;
  const type = session.metadata?.type;
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

  if (!userId || !paymentIntentId) {
    console.error("[stripe] checkout session missing userId or payment_intent", session.id);
    return;
  }

  const admin = createAdminClient();

  if (type === "collection" || type === "collection_plus_love") {
    const { error } = await admin.from("subscriptions").upsert(
      {
        user_id: userId,
        plan: "full_profile_one_off",
        status: "active",
        stripe_payment_intent_id: paymentIntentId,
        includes_perfect_love: type === "collection_plus_love",
      },
      { onConflict: "stripe_payment_intent_id" }
    );
    if (error) console.error("[stripe] failed to record collection purchase:", error);
    return;
  }

  if (type === "single") {
    const assessmentId = session.metadata?.assessmentId;
    const reportId = session.metadata?.resultId ?? null;
    if (!assessmentId) {
      console.error("[stripe] single-report checkout session missing assessmentId", session.id);
      return;
    }

    const { error } = await admin.from("report_purchases").upsert(
      {
        user_id: userId,
        assessment_id: assessmentId,
        report_id: reportId,
        amount_cents: session.amount_total ?? 199,
        currency: session.currency ?? "usd",
        stripe_payment_intent_id: paymentIntentId,
      },
      { onConflict: "stripe_payment_intent_id" }
    );
    if (error) console.error("[stripe] failed to record single-report purchase:", error);
    return;
  }

  console.error("[stripe] checkout session had unrecognized metadata.type:", type, session.id);
}
