// Plain data, safe to import from Client Components (unlike client.ts,
// which pulls in the Stripe SDK and is server-only).

/**
 * The single per-assessment report unlock ("single" checkout type) is sold
 * under this pre-created Stripe Product for every assessment, rather than
 * an ad-hoc product created per checkout session.
 */
export const STRIPE_SINGLE_REPORT_PRODUCT_ID = "prod_TF7lYuAyy0AzZW";

/** Prices in USD cents. Passed inline via `price_data` in the checkout route — nothing pre-created in the Stripe Dashboard. */
export const PRICING = {
  singleReport: { amountCents: 199, label: "Unlock this report" },
  fullCollection: { amountCents: 1899, label: "Unlock the full collection" },
  collectionPlusLove: {
    amountCents: 3999,
    label: "Full collection + Perfect Love",
  },
} as const;

/** perfectlove.site is a separate platform — this constant is display-only. See README "Monetization" for the redemption-code fulfillment flow. */
export const PERFECT_LOVE_SITE_URL = "https://perfectlove.site";
