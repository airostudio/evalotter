import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import { recordPurchaseFromSession } from "@/lib/access/record-purchase";

/**
 * Source of truth for purchase fulfillment — register this endpoint in the
 * Stripe Dashboard (or `stripe listen --forward-to`) for the
 * `checkout.session.completed` event. The results page also confirms a
 * session immediately on redirect (`confirmCheckoutSessionAction`) for
 * instant UX, but that's a best-effort accelerator; this webhook is what
 * actually guarantees the purchase gets recorded even if the user closes
 * the tab before the redirect completes.
 */
export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await recordPurchaseFromSession(event.data.object);
  }

  return NextResponse.json({ received: true });
}
