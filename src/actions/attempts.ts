"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/current-user";
import { getAssessmentEngine } from "@/lib/assessment-engine/registry";
import { registerBuiltInAssessmentEngines } from "@/lib/assessment-engine/engines";
import { getAssessmentWithVersionById } from "@/lib/assessment-engine/queries";
import { mapResponse } from "@/lib/assessment-engine/mappers";
import { updateBrainProfileForResult } from "@/lib/scoring/brain-profile";
import { maybeGrantAchievements } from "@/lib/scoring/achievements";
import type { AnswerValue } from "@/types";

registerBuiltInAssessmentEngines();

/** Finds an in-progress attempt to resume, or starts a fresh one. Redirects into the runner. */
export async function startOrResumeAttemptAction(assessmentSlug: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: assessment, error: assessmentError } = await supabase
    .from("assessments")
    .select("id, current_version_id, status")
    .eq("slug", assessmentSlug)
    .single();

  if (assessmentError || !assessment) throw new Error("Assessment not found");
  if (assessment.status !== "published" || !assessment.current_version_id) {
    throw new Error("Assessment is not currently available");
  }

  const { data: existing } = await supabase
    .from("assessment_attempts")
    .select("id")
    .eq("user_id", user.id)
    .eq("assessment_id", assessment.id)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .maybeSingle();

  if (existing) {
    redirect(`/assessments/${assessmentSlug}/take?attempt=${existing.id}`);
  }

  const { data: attempt, error } = await supabase
    .from("assessment_attempts")
    .insert({
      user_id: user.id,
      assessment_id: assessment.id,
      assessment_version_id: assessment.current_version_id,
      status: "in_progress",
      progress_percent: 0,
    })
    .select("id")
    .single();

  if (error || !attempt) throw error ?? new Error("Could not start attempt");

  redirect(`/assessments/${assessmentSlug}/take?attempt=${attempt.id}`);
}

interface SaveResponseInput {
  attemptId: string;
  questionId: string;
  sectionId: string;
  answer: AnswerValue;
  responseTimeMs?: number;
  progressPercent: number;
  currentSectionId?: string;
  currentQuestionId?: string;
}

export async function saveResponseAction(input: SaveResponseInput) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error: responseError } = await supabase.from("assessment_responses").upsert(
    {
      attempt_id: input.attemptId,
      question_id: input.questionId,
      section_id: input.sectionId,
      answer: input.answer,
      response_time_ms: input.responseTimeMs,
      answered_at: new Date().toISOString(),
    },
    { onConflict: "attempt_id,question_id" }
  );

  if (responseError) throw responseError;

  const { error: attemptError } = await supabase
    .from("assessment_attempts")
    .update({
      last_activity_at: new Date().toISOString(),
      progress_percent: input.progressPercent,
      current_section_id: input.currentSectionId,
      current_question_id: input.currentQuestionId,
    })
    .eq("id", input.attemptId)
    .eq("user_id", user.id);

  if (attemptError) throw attemptError;

  return { ok: true as const };
}

export async function completeAttemptAction(attemptId: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: attemptRow, error: attemptError } = await supabase
    .from("assessment_attempts")
    .select("*")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .single();

  if (attemptError || !attemptRow) throw attemptError ?? new Error("Attempt not found");

  const assessment = await getAssessmentWithVersionById(
    attemptRow.assessment_id,
    attemptRow.assessment_version_id
  );
  if (!assessment) throw new Error("Assessment version not found");

  const { data: responseRows, error: responsesError } = await supabase
    .from("assessment_responses")
    .select("*")
    .eq("attempt_id", attemptId);

  if (responsesError) throw responsesError;
  const responses = (responseRows ?? []).map(mapResponse);

  const attempt = {
    id: attemptRow.id,
    userId: attemptRow.user_id,
    assessmentId: attemptRow.assessment_id,
    assessmentVersionId: attemptRow.assessment_version_id,
    status: attemptRow.status,
    progressPercent: Number(attemptRow.progress_percent),
    startedAt: attemptRow.started_at,
    lastActivityAt: attemptRow.last_activity_at,
  } as const;

  const engine = getAssessmentEngine(assessment.engineType);
  const scoring = await engine.scoringEngine(assessment, attempt as never, responses);

  const totalTimeMs = Date.now() - new Date(attemptRow.started_at).getTime();

  const { error: completeError } = await supabase
    .from("assessment_attempts")
    .update({
      status: "completed",
      progress_percent: 100,
      completed_at: new Date().toISOString(),
      total_time_ms: totalTimeMs,
    })
    .eq("id", attemptId);

  if (completeError) throw completeError;

  const { data: resultRow, error: resultError } = await supabase
    .from("assessment_results")
    .insert({
      attempt_id: attemptId,
      assessment_id: assessment.id,
      assessment_version_id: assessment.version.id,
      user_id: user.id,
      overall_score: scoring.overallScore,
      overall_range_id: scoring.overallRange?.id ?? null,
    })
    .select("id")
    .single();

  if (resultError || !resultRow) throw resultError ?? new Error("Could not save result");

  if (scoring.dimensions.length > 0) {
    const { error: dimError } = await supabase.from("result_dimensions").insert(
      scoring.dimensions.map((d) => ({
        result_id: resultRow.id,
        dimension_key: d.dimensionKey,
        label: d.label,
        raw_score: d.rawScore,
        score: d.score,
        percentile: d.percentile ?? null,
        range_id: d.range?.id ?? null,
      }))
    );
    if (dimError) throw dimError;
  }

  await updateBrainProfileForResult(user.id, assessment, scoring);
  await maybeGrantAchievements(user.id);

  revalidatePath("/dashboard");
  revalidatePath("/brain-profile");
  redirect(`/results/${attemptId}`);
}
