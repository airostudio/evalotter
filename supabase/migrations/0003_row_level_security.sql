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
