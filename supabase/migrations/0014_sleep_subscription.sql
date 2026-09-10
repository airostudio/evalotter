-- Plans for the optional sleep-audio add-on.
--
-- subscriptions already carries everything a recurring plan needs — status
-- (including 'trialing'), stripe_subscription_id, current_period_end — it
-- had simply never been used for one; the only live plan so far is the
-- one-off 'full_profile_one_off'.
--
-- Distinct values rather than reusing premium_monthly/premium_annual: this
-- is a separate optional product, and a user may hold it without holding
-- the assessment collection, or the reverse. Collapsing them would make
-- "what has this person paid for" unanswerable.
--
-- Enum values cannot be added inside a transaction block in older
-- Postgres, and cannot be dropped at all, so this is deliberately additive
-- and idempotent.

alter type subscription_plan add value if not exists 'sleep_monthly';
alter type subscription_plan add value if not exists 'sleep_annual';

-- A user has at most one live subscription per plan family; this keeps a
-- webhook retry from creating a second row for the same Stripe id.
create unique index if not exists subscriptions_stripe_subscription_id_key
  on subscriptions (stripe_subscription_id)
  where stripe_subscription_id is not null;

create index if not exists subscriptions_user_plan_idx on subscriptions (user_id, plan);
