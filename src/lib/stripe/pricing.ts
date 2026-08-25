// Plain data, safe to import from Client Components (unlike client.ts,
// which pulls in the Stripe SDK and is server-only).

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
