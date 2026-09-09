-- Make the existing admin_activity table usable as a real audit trail.
--
-- The table has been in the schema since 0001 but was never written to, and
-- its shape is a little tight for the job:
--   * entity_id is uuid, so a target identified by anything else (a slug, a
--     Stripe id, a redemption code) cannot be recorded
--   * there is no human-readable line, so reading the log means decoding
--     metadata by eye
--   * actor_id is set null on delete, so removing a user erases who did it
--
-- Additive only: existing columns are untouched.
--
-- Note the existing policy is `for all` to admins, which means an admin can
-- delete rows. Tightening that to append-only is a deliberate follow-up: it
-- would change behaviour for anything already relying on the open policy,
-- and nothing writes here yet.

alter table admin_activity add column if not exists actor_email text;
alter table admin_activity add column if not exists summary text;
alter table admin_activity add column if not exists target_ref text;

-- entity_type is NOT NULL in 0001; give it a default so a write that only
-- concerns the actor (a self-promotion via ADMIN_EMAILS) does not need to
-- invent one.
alter table admin_activity alter column entity_type set default 'system';

create index if not exists admin_activity_created_idx on admin_activity (created_at desc);
create index if not exists admin_activity_target_ref_idx on admin_activity (target_ref);
