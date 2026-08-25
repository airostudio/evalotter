-- The $39.99 tier bundles the EvalOtter full-collection unlock with access
-- to Perfect Love (perfectlove.site), a separate astrology platform. It
-- still grants plan = 'full_profile_one_off' here (identical EvalOtter
-- access to the $18.99 tier) — this flag is only to know which purchases
-- also owe a Perfect Love unlock, since there's no live integration between
-- the two platforms to provision that side automatically.
alter table subscriptions
  add column includes_perfect_love boolean not null default false;
