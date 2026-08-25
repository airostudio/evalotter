-- One code per successful "collection + Perfect Love" purchase
-- (stripe_payment_intent_id), redeemable exactly once. The redemption flip
-- (status: issued -> redeemed) is done with a single `UPDATE ... WHERE
-- status = 'issued'` from the API route, not a select-then-update, so
-- concurrent redemption attempts for the same code can't both succeed.
create table perfect_love_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  code text not null unique,
  status text not null default 'issued' check (status in ('issued', 'redeemed')),
  stripe_payment_intent_id text not null unique,
  issued_at timestamptz not null default now(),
  redeemed_at timestamptz,
  redeemed_by_email text
);

create index perfect_love_codes_user_idx on perfect_love_codes (user_id);

alter table perfect_love_codes enable row level security;

-- Owner can see their own code (to display/copy it); all writes go through
-- the service-role client (issued by the Stripe webhook/confirm action,
-- redeemed by the server-to-server /api/perfect-love/redeem route), never
-- directly by the client, so there's no insert/update policy here.
create policy "perfect_love_codes_owner_read" on perfect_love_codes for select
  using (user_id = auth.uid());
