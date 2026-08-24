import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/current-user";
import { getAssessmentWithVersionById } from "@/lib/assessment-engine/queries";
import { mapResponse } from "@/lib/assessment-engine/mappers";
import { registerBuiltInAssessmentEngines } from "@/lib/assessment-engine/engines";
import { getAssessmentEngine } from "@/lib/assessment-engine/registry";

registerBuiltInAssessmentEngines();

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ attempt?: string }>;
}

export default async function TakeAssessmentPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { attempt: attemptId } = await searchParams;
  const user = await requireUser();

  if (!attemptId) redirect(`/assessments/${slug}`);

  const supabase = await createClient();
  const { data: attemptRow, error } = await supabase
    .from("assessment_attempts")
    .select("*")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .single();

  if (error || !attemptRow) notFound();

  if (attemptRow.status === "completed") {
    redirect(`/results/${attemptRow.id}`);
  }

  const assessment = await getAssessmentWithVersionById(
    attemptRow.assessment_id,
    attemptRow.assessment_version_id
  );
  if (!assessment) notFound();

  const { data: responseRows } = await supabase
    .from("assessment_responses")
    .select("*")
    .eq("attempt_id", attemptId);

  const responses = (responseRows ?? []).map(mapResponse);

  const engine = getAssessmentEngine(assessment.engineType);
  const attempt = {
    id: attemptRow.id,
    userId: attemptRow.user_id,
    assessmentId: attemptRow.assessment_id,
    assessmentVersionId: attemptRow.assessment_version_id,
    status: attemptRow.status,
    currentSectionId: attemptRow.current_section_id,
    currentQuestionId: attemptRow.current_question_id,
    progressPercent: Number(attemptRow.progress_percent),
    startedAt: attemptRow.started_at,
    lastActivityAt: attemptRow.last_activity_at,
  };

  const Renderer = engine.renderer;

  return <Renderer assessment={assessment} attempt={attempt as never} responses={responses} />;
}
