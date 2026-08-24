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
    // An assessment can have several scoring dimensions mapped to the same
    // brain-profile axis (e.g. multiple EQ-i facets all feeding
    // "emotional"). Combine those via weighted average up front — writing
    // each rule with its own upsert would have the last rule silently
    // clobber the others, since they'd all target the same row.
    const contributionsByTarget = new Map<string, { weightedSum: number; weightSum: number; label: string }>();

    for (const rule of rules) {
      const dimension = scoring.dimensions.find((d) => d.dimensionKey === rule.source_dimension_key);
      if (!dimension) continue;

      const weight = Number(rule.weight);
      const target = rule.target_brain_profile_dimension_key;
      const existing = contributionsByTarget.get(target);
      if (existing) {
        existing.weightedSum += dimension.score * weight;
        existing.weightSum += weight;
      } else {
        contributionsByTarget.set(target, {
          weightedSum: dimension.score * weight,
          weightSum: weight,
          label: dimension.label,
        });
      }
    }

    for (const [targetKey, agg] of contributionsByTarget) {
      if (agg.weightSum <= 0) continue;

      const { data: existingRow } = await supabase
        .from("brain_profile_dimensions")
        .select("score")
        .eq("user_id", userId)
        .eq("dimension_key", targetKey)
        .maybeSingle();

      // NB: contributions from a *different* assessment mapped to the same
      // axis still simply overwrite rather than blend — combining across
      // assessments (and replacing a stale contribution on retake, rather
      // than double-counting it) needs a per-assessment contribution table
      // to do correctly. Fine for v1 since launch assessments each own a
      // distinct axis; revisit if that changes.
      await supabase.from("brain_profile_dimensions").upsert(
        {
          user_id: userId,
          dimension_key: targetKey,
          label: agg.label,
          score: agg.weightedSum / agg.weightSum,
          previous_score: existingRow?.score ?? null,
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
