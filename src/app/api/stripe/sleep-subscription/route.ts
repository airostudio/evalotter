import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/current-user";
import { hasSleepAccess } from "@/lib/access/entitlements";
import { SLEEP_BRAND, SLEEP_PRICING } from "@/config/sleep";

/**
 * Opens a Stripe Checkout session for a DriftOff subscription.
 *
 * Recurring, unlike every other checkout on the platform — those are
 * one-time payments. The trial is configured on the subscription rather
 * than faked with a delayed charge, so Stripe owns the trial clock and the
 * customer sees the real terms on Stripe's own page.
 *
 * Amounts come from SLEEP_PRICING, never from the request: the client
 * chooses an interval, not a price.
 */
export async function POST(request: Request) {
  const user = await requireUser();
  const supabase = await createClient();

  if (await hasSleepAccess(supabase, user.id)) {
    return NextResponse.json({ error: "You already have an active subscription" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const interval = body?.interval === "monthly" ? "monthly" : "annual";
  const price = interval === "monthly" ? SLEEP_PRICING.monthly : SLEEP_PRICING.annual;

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: "Payments are not configured" }, { status: 503 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    return NextResponse.json({ error: "NEXT_PUBLIC_SITE_URL is not configured" }, { status: 500 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      client_reference_id: user.id,
      customer_email: user.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: price.currency,
            unit_amount: price.amountCents,
            recurring: { interval: interval === "monthly" ? "month" : "year" },
            product_data: {
              name: `${SLEEP_BRAND.name} — ${interval === "monthly" ? "Monthly" : "Annual"}`,
              description: SLEEP_BRAND.summary,
            },
          },
        },
      ],
      subscription_data: {
        trial_period_days: SLEEP_PRICING.trialDays,
        // Carried onto the subscription so webhook events can be resolved
        // back to a user without a second lookup.
        metadata: { userId: user.id, plan: price.plan },
      },
      metadata: { userId: user.id, plan: price.plan, kind: "sleep_subscription" },
      success_url: `${siteUrl}/sleep?subscribed=1`,
      cancel_url: `${siteUrl}/sleep`,
    });

    if (!session.url) throw new Error("Stripe returned no checkout URL");
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/sleep-subscription] failed:", err);
    return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
  }
}
