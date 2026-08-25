import "server-only";
import Stripe from "stripe";

let cachedClient: Stripe | null = null;

/**
 * Lazily-constructed Stripe client, mirroring `getAnthropicClient()` — never
 * throws at import time so the app still builds/runs without payment keys
 * configured. Callers that actually need to charge a card should check for
 * `null` and degrade (e.g. the checkout route returns a clear error instead
 * of crashing).
 */
export function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  if (!cachedClient) {
    cachedClient = new Stripe(secretKey, { apiVersion: "2024-10-28.acacia" });
  }
  return cachedClient;
}

/** Prices in USD cents. Passed inline via `price_data` in the checkout route — nothing pre-created in the Stripe Dashboard. */
export const PRICING = {
  singleReport: { amountCents: 199, label: "Unlock this report" },
  fullCollection: { amountCents: 1899, label: "Unlock the full collection" },
  collectionPlusLove: {
    amountCents: 3999,
    label: "Full collection + Perfect Love",
  },
} as const;

/** perfectlove.site is a separate platform — this constant is display-only. Fulfillment of that side is manual; see README "Monetization". */
export const PERFECT_LOVE_SITE_URL = "https://perfectlove.site";
