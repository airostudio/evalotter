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
