-- Helper functions & triggers

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on profiles
  for each row execute function set_updated_at();

create trigger assessments_set_updated_at before update on assessments
  for each row execute function set_updated_at();

create trigger questions_set_updated_at before update on questions
  for each row execute function set_updated_at();

create trigger subscriptions_set_updated_at before update on subscriptions
  for each row execute function set_updated_at();

-- Returns the caller's role from profiles. Used throughout RLS policies.
create or replace function current_user_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('admin', 'super_admin') from profiles where id = auth.uid()),
    false
  );
$$;

create or replace function is_editor_or_above()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('editor', 'admin', 'super_admin') from profiles where id = auth.uid()),
    false
  );
$$;

-- Creates a profile row automatically when a new auth user signs up.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name, display_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  );

  insert into user_brain_profiles (user_id, assessments_total)
  values (new.id, (select count(*) from assessments where status = 'published'));

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
