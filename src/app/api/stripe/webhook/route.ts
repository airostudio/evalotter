import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import { recordSubscriptionFromStripe } from "@/lib/access/record-subscription";
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

  // A subscription checkout is settled through the subscription events
  // below, not here: at checkout.session.completed a trialing subscription
  // has taken no payment yet, and its period end is only known from the
  // subscription object itself.
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.mode === "subscription") {
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await recordSubscriptionFromStripe(subscription);
      }
    } else {
      await recordPurchaseFromSession(session);
    }
  }

  // Covers the whole lifecycle: trial converting to paid, a renewal, a
  // failed payment, and cancellation. Without these the row would freeze at
  // whatever it was on day one and a cancelled user would keep access.
  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    await recordSubscriptionFromStripe(event.data.object);
  }

  return NextResponse.json({ received: true });
}
