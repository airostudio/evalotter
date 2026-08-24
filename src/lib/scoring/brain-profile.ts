import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AssessmentWithVersion, ScoringOutput } from "@/types";

/**
 * Rolls a completed result's dimension scores into the user's Brain
 * Profile, using the assessment's `brain_profile_contribution_rules` to
 * decide which scoring dimensions feed which aggregate dimension (and at
 * what weight) — or skip entirely, e.g. Palmistry never contributes.
 */
export async function updateBrainProfileForResult(
  userId: string,
  assessment: AssessmentWithVersion,
  scoring: ScoringOutput
) {
  const supabase = await createClient();

  const { data: rules } = await supabase
    .from("brain_profile_contribution_rules")
    .select("*")
    .eq("assessment_id", assessment.id);

  if (rules && rules.length > 0) {
    for (const rule of rules) {
      const dimension = scoring.dimensions.find((d) => d.dimensionKey === rule.source_dimension_key);
      if (!dimension) continue;

      const { data: existing } = await supabase
        .from("brain_profile_dimensions")
        .select("score")
        .eq("user_id", userId)
        .eq("dimension_key", rule.target_brain_profile_dimension_key)
        .maybeSingle();

      await supabase.from("brain_profile_dimensions").upsert(
        {
          user_id: userId,
          dimension_key: rule.target_brain_profile_dimension_key,
          label: dimension.label,
          score: dimension.score * Number(rule.weight),
          previous_score: existing?.score ?? null,
          contributing_assessment_slugs: [assessment.slug],
          last_updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,dimension_key" }
      );
    }
  }

  const { data: dims } = await supabase
    .from("brain_profile_dimensions")
    .select("score")
    .eq("user_id", userId)
    .not("score", "is", null);

  const { count: completedCount } = await supabase
    .from("assessment_results")
    .select("assessment_id", { count: "exact", head: true })
    .eq("user_id", userId);

  const scores = (dims ?? []).map((d) => Number(d.score)).filter((n) => !Number.isNaN(n));
  const evalotterScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  const { data: sorted } = await supabase
    .from("brain_profile_dimensions")
    .select("dimension_key, score")
    .eq("user_id", userId)
    .not("score", "is", null)
    .order("score", { ascending: false });

  await supabase.from("user_brain_profiles").upsert(
    {
      user_id: userId,
      evalotter_score: evalotterScore,
      assessments_completed: completedCount ?? 0,
      strongest_dimension_key: sorted?.[0]?.dimension_key ?? null,
      weakest_dimension_key: sorted?.[sorted.length - 1]?.dimension_key ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}
