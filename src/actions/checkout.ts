"use server";

import { requireUser } from "@/lib/auth/current-user";
import { getStripeClient } from "@/lib/stripe/client";
import { recordPurchaseFromSession } from "@/lib/access/record-purchase";

/**
 * Best-effort instant-unlock path: called from the results page when it
 * loads with `?checkout_session_id=...` (Stripe's redirect after a
 * successful Checkout). Verifies the session actually belongs to the
 * signed-in user and was actually paid, then records the same purchase the
 * webhook would — idempotently, so it's harmless if the webhook already
 * beat it there (or arrives after). Never trust the query param alone: a
 * session id is not a secret, so ownership is re-checked against Stripe.
 */
export async function confirmCheckoutSessionAction(sessionId: string): Promise<{ ok: boolean }> {
  const stripe = getStripeClient();
  if (!stripe) return { ok: false };

  const user = await requireUser();

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.metadata?.userId !== user.id) {
    console.error("[checkout] session/user mismatch on confirm", sessionId, user.id);
    return { ok: false };
  }

  await recordPurchaseFromSession(session);
  return { ok: true };
}
