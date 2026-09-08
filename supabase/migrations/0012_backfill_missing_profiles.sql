-- Backfill profiles/brain profiles for auth users that have neither.
--
-- Symptom this fixes: clicking "Start assessment" returned a 500 —
--   insert or update on table "assessment_attempts" violates foreign key
--   constraint "assessment_attempts_user_id_fkey"
--   Key is not present in table "profiles".
--
-- assessment_attempts.user_id references profiles(id), and profiles rows are
-- normally created by the on_auth_user_created trigger (migration 0002).
-- Any account created while that trigger was absent — or if it ever fails —
-- can sign in perfectly well but cannot start an assessment, because it has
-- no profile row for the attempt to reference.
--
-- Idempotent: safe to run repeatedly.

-- 1. Profiles for auth users that have none. Mirrors handle_new_user().
insert into profiles (id, full_name, display_name)
select u.id,
       u.raw_user_meta_data ->> 'full_name',
       coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1))
from auth.users u
where not exists (select 1 from profiles p where p.id = u.id);

-- 2. Brain profiles for the same population.
insert into user_brain_profiles (user_id, assessments_total)
select p.id, (select count(*) from assessments where status = 'published')
from profiles p
where not exists (select 1 from user_brain_profiles b where b.user_id = p.id);

-- 3. Re-assert the trigger, in case it was never created on this database.
--    handle_new_user() itself is defined in 0002 and unchanged here.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
