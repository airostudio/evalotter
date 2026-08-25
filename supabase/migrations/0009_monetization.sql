-- Idempotency for Stripe webhook + checkout-return confirmation writing to
-- the same purchase from two different paths (the webhook, and the
-- best-effort confirm-on-redirect fallback): both upsert on
-- stripe_payment_intent_id, so a unique constraint makes a double-write a
-- no-op instead of a duplicate row.

alter table report_purchases
  add constraint report_purchases_payment_intent_unique unique (stripe_payment_intent_id);

-- The existing subscriptions table was modeled for recurring Stripe
-- Subscriptions (stripe_subscription_id). The full-collection unlock is a
-- one-off Checkout payment with no Subscription object, so it needs its own
-- identifier to dedupe against.
alter table subscriptions
  add column stripe_payment_intent_id text,
  add constraint subscriptions_payment_intent_unique unique (stripe_payment_intent_id);
