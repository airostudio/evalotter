-- EvalOtter combined schema — DESTRUCTIVE
-- Auto-generated from supabase/migrations/*.sql. Run this against your
-- Supabase project's SQL editor to get a clean copy of the full schema.
-- Regenerate with: cat supabase/migrations/*.sql (see git history) rather than editing by hand.
--
-- WARNING: the teardown block below drops every EvalOtter table, type,
-- function, storage object, and storage bucket this schema owns — auth.users
-- itself and any Supabase-managed tables are untouched, but all application
-- data (profiles, attempts, results, purchases, everything) is gone
-- afterward. Only run this against a project with no data you need to keep.
-- If you ever do have real user data, drop this block and apply
-- supabase/migrations/*.sql incrementally instead (each file only adds).
--
-- Wrapped in explicit transactions: PostgreSQL forbids using a newly added enum
-- value (memory_recognition, coming_soon) in the same transaction that added it,
-- so those two ALTER TYPE statements each get their own commit boundary below.

begin;

-- ============================================================
-- Teardown — drops every object this schema creates, in dependency order
-- (children before parents; cascade as a safety net for anything missed).
-- Safe to run against an empty database (every statement is "if exists").
-- ============================================================

-- The auth.users trigger must go first since it calls a function in the
-- tables/functions being dropped below.
drop trigger if exists on_auth_user_created on auth.users;

-- Storage: policies, then objects, then the buckets themselves.
drop policy if exists "palmistry_owner_rw" on storage.objects;
drop policy if exists "reports_owner_rw" on storage.objects;
drop policy if exists "assessment_media_public_read" on storage.objects;
drop policy if exists "assessment_media_editor_write" on storage.objects;
drop policy if exists "assessment_media_editor_update" on storage.objects;
drop policy if exists "assessment_media_editor_delete" on storage.objects;
delete from storage.objects where bucket_id in ('palmistry', 'reports', 'assessment-media');
delete from storage.buckets where id in ('palmistry', 'reports', 'assessment-media');

-- Application tables (cascade drops their own indexes/policies/FKs).
drop table if exists perfect_love_codes cascade;
drop table if exists admin_activity cascade;
drop table if exists report_purchases cascade;
drop table if exists subscriptions cascade;
drop table if exists reports cascade;
drop table if exists user_achievements cascade;
drop table if exists achievements cascade;
drop table if exists palmistry_submissions cascade;
drop table if exists uploaded_media cascade;
drop table if exists ai_interpretations cascade;
drop table if exists brain_profile_contribution_rules cascade;
drop table if exists brain_profile_dimensions cascade;
drop table if exists user_brain_profiles cascade;
drop table if exists result_dimensions cascade;
drop table if exists assessment_results cascade;
drop table if exists assessment_responses cascade;
drop table if exists assessment_attempts cascade;
drop table if exists result_ranges cascade;
drop table if exists scoring_rules cascade;
drop table if exists scoring_dimensions cascade;
drop table if exists assessment_questions cascade;
drop table if exists question_options cascade;
drop table if exists questions cascade;
drop table if exists assessment_sections cascade;
drop table if exists assessment_versions cascade;
drop table if exists assessments cascade;
drop table if exists assessment_categories cascade;
drop table if exists profiles cascade;

-- Functions (cascade in case anything above was missed).
drop function if exists handle_new_user() cascade;
drop function if exists is_editor_or_above() cascade;
drop function if exists is_admin() cascade;
drop function if exists current_user_role() cascade;
drop function if exists set_updated_at() cascade;

-- Enum types — must come after every table that used them is gone.
drop type if exists subscription_status cascade;
drop type if exists subscription_plan cascade;
drop type if exists ai_provider cascade;
drop type if exists ai_interpretation_status cascade;
drop type if exists attempt_status cascade;
drop type if exists scoring_formula cascade;
drop type if exists question_type cascade;
drop type if exists assessment_difficulty cascade;
drop type if exists assessment_access cascade;
drop type if exists assessment_status cascade;
drop type if exists assessment_engine_type cascade;
drop type if exists user_role cascade;

commit;

-- ============================================================
-- Rebuild — the full schema, from supabase/migrations/0001 through the
-- latest, applied in order.
-- ============================================================

begin;

-- ============================================================
-- 0001_core_schema.sql
-- ============================================================
-- EvalOtter core schema
-- Conventions: UUID primary keys, created_at/updated_at on mutable tables,
-- snake_case columns, FKs with sensible ON DELETE behavior, indexes on FKs
-- and columns used for lookups/filters.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Roles & profiles
-- ---------------------------------------------------------------------------

create type user_role as enum ('user', 'editor', 'admin', 'super_admin');

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  display_name text,
  avatar_url text,
  role user_role not null default 'user',
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on profiles (role);

-- ---------------------------------------------------------------------------
-- Assessment catalogue
-- ---------------------------------------------------------------------------

create type assessment_engine_type as enum (
  'standard_questionnaire',
  'timed_questionnaire',
  'cognitive_game',
  'memory_exercise',
  'pattern_recognition',
  'image_based',
  'ai_analysis',
  'vision_analysis',
  'hybrid',
  'custom_interactive'
);

create type assessment_status as enum ('draft', 'review', 'published', 'archived');
create type assessment_access as enum ('free', 'premium');
create type assessment_difficulty as enum ('easy', 'medium', 'hard');

create table assessment_categories (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  description text,
  icon text,
  "order" integer not null default 0
);

create table assessments (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text not null,
  long_description text not null default '',
  icon text not null default 'brain',
  cover_image_url text,
  category_id uuid not null references assessment_categories (id) on delete restrict,
  engine_type assessment_engine_type not null default 'standard_questionnaire',
  difficulty assessment_difficulty not null default 'medium',
  estimated_duration_minutes integer not null default 10,
  question_count integer not null default 0,
  featured boolean not null default false,
  access assessment_access not null default 'free',
  status assessment_status not null default 'draft',
  current_version_id uuid, -- FK added after assessment_versions exists
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index assessments_category_idx on assessments (category_id);
create index assessments_status_idx on assessments (status);
create index assessments_slug_idx on assessments (slug);

-- Immutable published snapshots. Attempts always reference a specific
-- version so editing a live assessment never corrupts historical results.
create table assessment_versions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments (id) on delete cascade,
  version_number integer not null,
  status assessment_status not null default 'draft',
  settings jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (assessment_id, version_number)
);

create index assessment_versions_assessment_idx on assessment_versions (assessment_id);

alter table assessments
  add constraint assessments_current_version_fk
  foreign key (current_version_id) references assessment_versions (id) on delete set null;

create table assessment_sections (
  id uuid primary key default gen_random_uuid(),
  assessment_version_id uuid not null references assessment_versions (id) on delete cascade,
  name text not null,
  description text,
  instructions text,
  time_limit_seconds integer,
  randomize_questions boolean not null default false,
  question_count integer,
  weight numeric not null default 1,
  "order" integer not null default 0
);

create index assessment_sections_version_idx on assessment_sections (assessment_version_id);

-- ---------------------------------------------------------------------------
-- Question library (reusable across assessments)
-- ---------------------------------------------------------------------------

create type question_type as enum (
  'multiple_choice',
  'multiple_select',
  'true_false',
  'rating_scale',
  'likert_scale',
  'slider',
  'numeric_input',
  'text_input',
  'long_text',
  'image_choice',
  'image_upload',
  'sequence',
  'drag_drop',
  'matching',
  'timed_choice',
  'memory_recall',
  'pattern_question',
  'visual_rotation',
  'open_creative',
  'custom_interactive'
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  question_type question_type not null,
  question_text text not null,
  instructions text,
  media jsonb default '[]'::jsonb,
  correct_answer jsonb,
  score_config jsonb default '[]'::jsonb, -- ScoreImpact[]
  difficulty assessment_difficulty,
  category text,
  tags text[] not null default '{}',
  time_limit_seconds integer,
  required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index questions_type_idx on questions (question_type);
create index questions_category_idx on questions (category);
create index questions_tags_idx on questions using gin (tags);

create table question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions (id) on delete cascade,
  label text not null,
  value text not null,
  image_url text,
  is_correct boolean,
  "order" integer not null default 0,
  score_config jsonb default '[]'::jsonb
);

create index question_options_question_idx on question_options (question_id);

-- Join table: which questions belong to which assessment version/section, with ordering.
create table assessment_questions (
  id uuid primary key default gen_random_uuid(),
  assessment_version_id uuid not null references assessment_versions (id) on delete cascade,
  section_id uuid not null references assessment_sections (id) on delete cascade,
  question_id uuid not null references questions (id) on delete restrict,
  "order" integer not null default 0,
  weight numeric not null default 1,
  conditional jsonb,
  unique (assessment_version_id, question_id)
);

create index assessment_questions_version_idx on assessment_questions (assessment_version_id);
create index assessment_questions_section_idx on assessment_questions (section_id);

-- ---------------------------------------------------------------------------
-- Scoring configuration
-- ---------------------------------------------------------------------------

create table scoring_dimensions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments (id) on delete cascade,
  key text not null,
  label text not null,
  description text,
  contributes_to_brain_profile boolean not null default false,
  brain_profile_dimension_key text,
  "order" integer not null default 0,
  unique (assessment_id, key)
);

create index scoring_dimensions_assessment_idx on scoring_dimensions (assessment_id);

create type scoring_formula as enum ('sum', 'weighted_sum', 'average', 'weighted_average', 'custom');

create table scoring_rules (
  id uuid primary key default gen_random_uuid(),
  assessment_version_id uuid not null references assessment_versions (id) on delete cascade,
  dimension_key text not null,
  formula scoring_formula not null default 'weighted_sum',
  section_weights jsonb,
  time_bonus jsonb,
  penalty_per_incorrect numeric,
  normalization jsonb,
  unique (assessment_version_id, dimension_key)
);

create index scoring_rules_version_idx on scoring_rules (assessment_version_id);

create table result_ranges (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments (id) on delete cascade,
  dimension_key text not null default 'overall',
  min_score numeric not null,
  max_score numeric not null,
  title text not null,
  description text not null,
  recommendations text[] default '{}',
  icon text,
  ai_prompt_fragment text,
  "order" integer not null default 0
);

create index result_ranges_assessment_idx on result_ranges (assessment_id, dimension_key);

-- ---------------------------------------------------------------------------
-- Attempts, responses, results
-- ---------------------------------------------------------------------------

create type attempt_status as enum ('in_progress', 'completed', 'abandoned');

create table assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  assessment_id uuid not null references assessments (id) on delete cascade,
  assessment_version_id uuid not null references assessment_versions (id) on delete restrict,
  status attempt_status not null default 'in_progress',
  current_section_id uuid references assessment_sections (id) on delete set null,
  current_question_id uuid references questions (id) on delete set null,
  progress_percent numeric not null default 0,
  section_order uuid[],
  question_order jsonb, -- { [sectionId]: questionId[] }
  started_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  completed_at timestamptz,
  total_time_ms bigint
);

create index assessment_attempts_user_idx on assessment_attempts (user_id);
create index assessment_attempts_assessment_idx on assessment_attempts (assessment_id);
create index assessment_attempts_status_idx on assessment_attempts (status);

create table assessment_responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references assessment_attempts (id) on delete cascade,
  question_id uuid not null references questions (id) on delete cascade,
  section_id uuid not null references assessment_sections (id) on delete cascade,
  answer jsonb not null,
  is_correct boolean,
  response_time_ms integer,
  answered_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create index assessment_responses_attempt_idx on assessment_responses (attempt_id);

create table assessment_results (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null unique references assessment_attempts (id) on delete cascade,
  assessment_id uuid not null references assessments (id) on delete cascade,
  assessment_version_id uuid not null references assessment_versions (id) on delete restrict,
  user_id uuid not null references profiles (id) on delete cascade,
  overall_score numeric not null,
  overall_range_id uuid references result_ranges (id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  is_public_share boolean not null default false,
  created_at timestamptz not null default now()
);

create index assessment_results_user_idx on assessment_results (user_id);
create index assessment_results_assessment_idx on assessment_results (assessment_id);

create table result_dimensions (
  id uuid primary key default gen_random_uuid(),
  result_id uuid not null references assessment_results (id) on delete cascade,
  dimension_key text not null,
  label text not null,
  raw_score numeric not null,
  score numeric not null,
  percentile numeric,
  range_id uuid references result_ranges (id) on delete set null,
  unique (result_id, dimension_key)
);

create index result_dimensions_result_idx on result_dimensions (result_id);

-- ---------------------------------------------------------------------------
-- Brain Profile aggregation
-- ---------------------------------------------------------------------------

create table user_brain_profiles (
  user_id uuid primary key references profiles (id) on delete cascade,
  evalotter_score numeric,
  assessments_completed integer not null default 0,
  assessments_total integer not null default 0,
  strongest_dimension_key text,
  weakest_dimension_key text,
  updated_at timestamptz not null default now()
);

create table brain_profile_dimensions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  dimension_key text not null,
  label text not null,
  score numeric,
  previous_score numeric,
  contributing_assessment_slugs text[] not null default '{}',
  last_updated_at timestamptz,
  unique (user_id, dimension_key)
);

create index brain_profile_dimensions_user_idx on brain_profile_dimensions (user_id);

-- Admin-configurable rules for which assessment scoring dimensions feed
-- which brain-profile dimension. Deliberately explicit rather than implicit,
-- so e.g. Palmistry never contributes to the cognitive score.
create table brain_profile_contribution_rules (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments (id) on delete cascade,
  source_dimension_key text not null,
  target_brain_profile_dimension_key text not null,
  weight numeric not null default 1,
  unique (assessment_id, source_dimension_key)
);

-- ---------------------------------------------------------------------------
-- AI interpretation
-- ---------------------------------------------------------------------------

create type ai_interpretation_status as enum ('pending', 'completed', 'failed', 'skipped');
create type ai_provider as enum ('openai', 'anthropic');

create table ai_interpretations (
  id uuid primary key default gen_random_uuid(),
  result_id uuid not null references assessment_results (id) on delete cascade,
  status ai_interpretation_status not null default 'pending',
  provider ai_provider,
  summary text,
  strengths text[],
  development_areas text[],
  behavioural_interpretation text,
  recommendations text[],
  suggested_next_assessment_slug text,
  raw_response jsonb,
  created_at timestamptz not null default now()
);

create index ai_interpretations_result_idx on ai_interpretations (result_id);

-- ---------------------------------------------------------------------------
-- Media & Palmistry
-- ---------------------------------------------------------------------------

create table uploaded_media (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  storage_bucket text not null,
  storage_path text not null,
  mime_type text,
  purpose text not null default 'general', -- e.g. 'palmistry_left', 'palmistry_right'
  created_at timestamptz not null default now()
);

create index uploaded_media_user_idx on uploaded_media (user_id);

create table palmistry_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  attempt_id uuid references assessment_attempts (id) on delete set null,
  left_palm_media_id uuid references uploaded_media (id) on delete set null,
  right_palm_media_id uuid references uploaded_media (id) on delete set null,
  context_answers jsonb default '{}'::jsonb,
  analysis jsonb, -- heart_line, head_line, life_line, fate_line, hand_shape, finger_proportions, mounts, markers
  status text not null default 'pending', -- pending | analyzed | failed
  created_at timestamptz not null default now()
);

create index palmistry_submissions_user_idx on palmistry_submissions (user_id);

-- ---------------------------------------------------------------------------
-- Achievements
-- ---------------------------------------------------------------------------

create table achievements (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  description text not null,
  icon text not null default 'award'
);

create table user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  achievement_id uuid not null references achievements (id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);

create index user_achievements_user_idx on user_achievements (user_id);

-- ---------------------------------------------------------------------------
-- Reports
-- ---------------------------------------------------------------------------

create table reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  kind text not null default 'assessment', -- 'assessment' | 'brain_profile'
  result_id uuid references assessment_results (id) on delete cascade,
  storage_bucket text,
  storage_path text,
  status text not null default 'pending', -- pending | ready | failed
  created_at timestamptz not null default now()
);

create index reports_user_idx on reports (user_id);

-- ---------------------------------------------------------------------------
-- Monetisation (Stripe-ready, not required for core flow)
-- ---------------------------------------------------------------------------

create type subscription_plan as enum (
  'free',
  'premium_monthly',
  'premium_annual',
  'full_profile_one_off'
);

create type subscription_status as enum ('active', 'trialing', 'canceled', 'past_due', 'incomplete');

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  plan subscription_plan not null default 'free',
  status subscription_status not null default 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_user_idx on subscriptions (user_id);

create table report_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  report_id uuid references reports (id) on delete set null,
  assessment_id uuid references assessments (id) on delete set null,
  amount_cents integer not null,
  currency text not null default 'usd',
  stripe_payment_intent_id text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Admin activity log
-- ---------------------------------------------------------------------------

create table admin_activity (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index admin_activity_actor_idx on admin_activity (actor_id);
create index admin_activity_entity_idx on admin_activity (entity_type, entity_id);

-- ============================================================
-- 0002_functions_triggers.sql
-- ============================================================
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

-- ============================================================
-- 0003_row_level_security.sql
-- ============================================================
-- Row Level Security
-- Public catalogue data (assessments, categories, questions, scoring config,
-- result ranges, achievements) is readable by everyone so the marketing site
-- and catalogue work without auth. Everything user-specific is locked to
-- auth.uid(). Admin/editor roles get elevated access via is_admin()/is_editor_or_above().

alter table profiles enable row level security;
alter table assessment_categories enable row level security;
alter table assessments enable row level security;
alter table assessment_versions enable row level security;
alter table assessment_sections enable row level security;
alter table questions enable row level security;
alter table question_options enable row level security;
alter table assessment_questions enable row level security;
alter table scoring_dimensions enable row level security;
alter table scoring_rules enable row level security;
alter table result_ranges enable row level security;
alter table assessment_attempts enable row level security;
alter table assessment_responses enable row level security;
alter table assessment_results enable row level security;
alter table result_dimensions enable row level security;
alter table user_brain_profiles enable row level security;
alter table brain_profile_dimensions enable row level security;
alter table brain_profile_contribution_rules enable row level security;
alter table ai_interpretations enable row level security;
alter table uploaded_media enable row level security;
alter table palmistry_submissions enable row level security;
alter table achievements enable row level security;
alter table user_achievements enable row level security;
alter table reports enable row level security;
alter table subscriptions enable row level security;
alter table report_purchases enable row level security;
alter table admin_activity enable row level security;

-- profiles --------------------------------------------------------------
create policy "profiles_select_own_or_admin" on profiles for select
  using (id = auth.uid() or is_admin());
create policy "profiles_update_own" on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_admin_manage" on profiles for all
  using (is_admin()) with check (is_admin());

-- catalogue (public read; editor/admin write) ----------------------------
create policy "categories_public_read" on assessment_categories for select using (true);
create policy "categories_editor_write" on assessment_categories for all
  using (is_editor_or_above()) with check (is_editor_or_above());

create policy "assessments_public_read_published" on assessments for select
  using (status = 'published' or is_editor_or_above());
create policy "assessments_editor_write" on assessments for all
  using (is_editor_or_above()) with check (is_editor_or_above());

create policy "versions_public_read_published" on assessment_versions for select
  using (status = 'published' or is_editor_or_above());
create policy "versions_editor_write" on assessment_versions for all
  using (is_editor_or_above()) with check (is_editor_or_above());

create policy "sections_public_read" on assessment_sections for select
  using (
    exists (
      select 1 from assessment_versions v
      where v.id = assessment_version_id
        and (v.status = 'published' or is_editor_or_above())
    )
  );
create policy "sections_editor_write" on assessment_sections for all
  using (is_editor_or_above()) with check (is_editor_or_above());

create policy "questions_public_read" on questions for select using (true);
create policy "questions_editor_write" on questions for all
  using (is_editor_or_above()) with check (is_editor_or_above());

create policy "question_options_public_read" on question_options for select using (true);
create policy "question_options_editor_write" on question_options for all
  using (is_editor_or_above()) with check (is_editor_or_above());

create policy "assessment_questions_public_read" on assessment_questions for select using (true);
create policy "assessment_questions_editor_write" on assessment_questions for all
  using (is_editor_or_above()) with check (is_editor_or_above());

create policy "scoring_dimensions_public_read" on scoring_dimensions for select using (true);
create policy "scoring_dimensions_editor_write" on scoring_dimensions for all
  using (is_editor_or_above()) with check (is_editor_or_above());

create policy "scoring_rules_public_read" on scoring_rules for select using (true);
create policy "scoring_rules_editor_write" on scoring_rules for all
  using (is_editor_or_above()) with check (is_editor_or_above());

create policy "result_ranges_public_read" on result_ranges for select using (true);
create policy "result_ranges_editor_write" on result_ranges for all
  using (is_editor_or_above()) with check (is_editor_or_above());

create policy "brain_profile_rules_public_read" on brain_profile_contribution_rules for select using (true);
create policy "brain_profile_rules_editor_write" on brain_profile_contribution_rules for all
  using (is_editor_or_above()) with check (is_editor_or_above());

create policy "achievements_public_read" on achievements for select using (true);
create policy "achievements_editor_write" on achievements for all
  using (is_editor_or_above()) with check (is_editor_or_above());

-- attempts / responses / results (strictly owner-only + admin) ----------
create policy "attempts_owner_rw" on assessment_attempts for all
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

create policy "responses_owner_rw" on assessment_responses for all
  using (
    exists (
      select 1 from assessment_attempts a
      where a.id = attempt_id and (a.user_id = auth.uid() or is_admin())
    )
  )
  with check (
    exists (
      select 1 from assessment_attempts a
      where a.id = attempt_id and (a.user_id = auth.uid() or is_admin())
    )
  );

create policy "results_owner_read" on assessment_results for select
  using (user_id = auth.uid() or is_admin() or is_public_share = true);
create policy "results_owner_write" on assessment_results for insert
  with check (user_id = auth.uid() or is_admin());
create policy "results_owner_update" on assessment_results for update
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

create policy "result_dimensions_owner_read" on result_dimensions for select
  using (
    exists (
      select 1 from assessment_results r
      where r.id = result_id and (r.user_id = auth.uid() or is_admin() or r.is_public_share)
    )
  );
create policy "result_dimensions_owner_write" on result_dimensions for insert
  with check (
    exists (
      select 1 from assessment_results r
      where r.id = result_id and (r.user_id = auth.uid() or is_admin())
    )
  );

-- brain profile -----------------------------------------------------------
create policy "brain_profile_owner_rw" on user_brain_profiles for all
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

create policy "brain_profile_dimensions_owner_rw" on brain_profile_dimensions for all
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

-- AI interpretations --------------------------------------------------------
create policy "ai_interpretations_owner_read" on ai_interpretations for select
  using (
    exists (
      select 1 from assessment_results r
      where r.id = result_id and (r.user_id = auth.uid() or is_admin())
    )
  );
create policy "ai_interpretations_service_write" on ai_interpretations for insert
  with check (is_admin() or true); -- inserted by server actions using the caller's session

-- Media & Palmistry (strictly owner-only) ---------------------------------
create policy "uploaded_media_owner_rw" on uploaded_media for all
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

create policy "palmistry_owner_rw" on palmistry_submissions for all
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

-- Achievements earned, reports, subscriptions, purchases (owner-only) -----
create policy "user_achievements_owner_read" on user_achievements for select
  using (user_id = auth.uid() or is_admin());
create policy "user_achievements_service_write" on user_achievements for insert
  with check (user_id = auth.uid() or is_admin());

create policy "reports_owner_rw" on reports for all
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

create policy "subscriptions_owner_read" on subscriptions for select
  using (user_id = auth.uid() or is_admin());
create policy "subscriptions_admin_write" on subscriptions for all
  using (is_admin()) with check (is_admin());

create policy "report_purchases_owner_read" on report_purchases for select
  using (user_id = auth.uid() or is_admin());
create policy "report_purchases_admin_write" on report_purchases for all
  using (is_admin()) with check (is_admin());

-- Admin activity (admin-only) ----------------------------------------------
create policy "admin_activity_admin_only" on admin_activity for all
  using (is_admin()) with check (is_admin());

-- ============================================================
-- 0004_storage.sql
-- ============================================================
-- Storage buckets. Palmistry images and generated reports are private;
-- access is only ever via signed URLs generated server-side.

insert into storage.buckets (id, name, public)
values ('palmistry', 'palmistry', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('reports', 'reports', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('assessment-media', 'assessment-media', true)
on conflict (id) do nothing;

-- Palmistry: users may only read/write objects under a path prefixed with
-- their own user id, e.g. palmistry/{user_id}/left.jpg
create policy "palmistry_owner_rw" on storage.objects for all
  using (
    bucket_id = 'palmistry'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'palmistry'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "reports_owner_rw" on storage.objects for all
  using (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Assessment media (icons, question images) is public read, editor-managed.
create policy "assessment_media_public_read" on storage.objects for select
  using (bucket_id = 'assessment-media');

create policy "assessment_media_editor_write" on storage.objects for insert
  with check (bucket_id = 'assessment-media' and is_editor_or_above());

create policy "assessment_media_editor_update" on storage.objects for update
  using (bucket_id = 'assessment-media' and is_editor_or_above());

create policy "assessment_media_editor_delete" on storage.objects for delete
  using (bucket_id = 'assessment-media' and is_editor_or_above());

-- ============================================================
-- 0005_question_external_key.sql
-- ============================================================
-- A stable, human-assigned key for questions authored via the seed pipeline
-- (or, later, an admin builder), independent of the internal UUID. Lets
-- `npm run seed` upsert idempotently instead of duplicating rows on every
-- run, and is what makes cross-assessment question reuse addressable by
-- name (e.g. the flagship profile reusing Logical Reasoning's items).
alter table questions add column external_key text unique;

create index questions_external_key_idx on questions (external_key);

commit;

begin;

-- ============================================================
-- 0006_memory_recognition_question_type.sql
-- ============================================================
-- A dedicated question type for study-then-recognize memory exercises
-- (ISLT shopping list, SKT object recall): the study phase shows the
-- correct options, then the user picks them out of a shuffled grid that
-- includes distractors. Answer shape is the same as multiple_select (a set
-- of chosen option ids), so it reuses the existing, already-correct
-- multiple_select scoring path — only the UI/study-phase behavior differs
-- from a plain multiple_select question, which is why it's a distinct type
-- rather than overloading multiple_select's semantics.
alter type question_type add value 'memory_recognition';

commit;

begin;

-- ============================================================
-- 0007_coming_soon_status.sql
-- ============================================================
-- A distinct status for assessments that are on the public roadmap and
-- shown in the catalogue as a teaser, but have no content authored yet and
-- are never startable. Kept separate from 'draft' (which is
-- admin/editor-only and invisible to regular users) since coming-soon
-- entries are deliberately public-facing.
--
-- Split into its own migration file (rather than combined with the policy
-- update that uses this value): PostgreSQL disallows using a newly added
-- enum value within the same transaction that added it.
alter type assessment_status add value 'coming_soon';

commit;

begin;

-- ============================================================
-- 0008_coming_soon_rls.sql
-- ============================================================
drop policy "assessments_public_read_published" on assessments;
create policy "assessments_public_read_published" on assessments for select
  using (status in ('published', 'coming_soon') or is_editor_or_above());

commit;

begin;

-- ============================================================
-- 0009_monetization.sql
-- ============================================================
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

-- ============================================================
-- 0010_perfect_love_bundle.sql
-- ============================================================
-- The $39.99 tier bundles the EvalOtter full-collection unlock with access
-- to Perfect Love (perfectlove.site), a separate astrology platform. It
-- still grants plan = 'full_profile_one_off' here (identical EvalOtter
-- access to the $18.99 tier) — this flag is only to know which purchases
-- also owe a Perfect Love unlock, since there's no live integration between
-- the two platforms to provision that side automatically.
alter table subscriptions
  add column includes_perfect_love boolean not null default false;

commit;

begin;

-- ============================================================
-- 0011_perfect_love_codes.sql
-- ============================================================
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

commit;
