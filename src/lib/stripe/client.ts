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
