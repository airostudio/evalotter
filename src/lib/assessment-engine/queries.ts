import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Assessment, AssessmentWithVersion } from "@/types";
import {
  buildVersion,
  mapAssessment,
  mapAssessmentQuestion,
  mapCategory,
  mapQuestion,
  mapQuestionOption,
  mapResultRange,
  mapScoringDimension,
  mapScoringRule,
  mapSection,
} from "./mappers";

export async function listPublishedAssessments(): Promise<Assessment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assessments")
    .select("*, assessment_categories(*)")
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("title", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) =>
    mapAssessment(row, row.assessment_categories ? mapCategory(row.assessment_categories) : undefined)
  );
}

export async function listCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assessment_categories")
    .select("*")
    .order("order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapCategory);
}

/**
 * Loads a published assessment with its currently-published version fully
 * hydrated (sections, questions + options, scoring config, result ranges).
 * This is what the runner, catalogue detail page, and admin preview all use.
 */
export async function getAssessmentWithVersionBySlug(
  slug: string
): Promise<AssessmentWithVersion | null> {
  const supabase = await createClient();

  const { data: assessmentRow, error: assessmentError } = await supabase
    .from("assessments")
    .select("*, assessment_categories(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (assessmentError) throw assessmentError;
  if (!assessmentRow || !assessmentRow.current_version_id) return null;

  return hydrateVersion(assessmentRow);
}

export async function getAssessmentWithVersionById(
  assessmentId: string,
  versionId: string
): Promise<AssessmentWithVersion | null> {
  const supabase = await createClient();
  const { data: assessmentRow, error } = await supabase
    .from("assessments")
    .select("*, assessment_categories(*)")
    .eq("id", assessmentId)
    .maybeSingle();

  if (error) throw error;
  if (!assessmentRow) return null;

  return hydrateVersion(assessmentRow, versionId);
}

async function hydrateVersion(assessmentRow: any, versionIdOverride?: string): Promise<AssessmentWithVersion | null> {
  const supabase = await createClient();
  const versionId = versionIdOverride ?? assessmentRow.current_version_id;

  const [versionRes, sectionsRes, aqRes, dimsRes, rulesRes, rangesRes] = await Promise.all([
    supabase.from("assessment_versions").select("*").eq("id", versionId).single(),
    supabase
      .from("assessment_sections")
      .select("*")
      .eq("assessment_version_id", versionId)
      .order("order", { ascending: true }),
    supabase
      .from("assessment_questions")
      .select("*, questions(*, question_options(*))")
      .eq("assessment_version_id", versionId)
      .order("order", { ascending: true }),
    supabase
      .from("scoring_dimensions")
      .select("*")
      .eq("assessment_id", assessmentRow.id)
      .order("order", { ascending: true }),
    supabase.from("scoring_rules").select("*").eq("assessment_version_id", versionId),
    supabase
      .from("result_ranges")
      .select("*")
      .eq("assessment_id", assessmentRow.id)
      .order("order", { ascending: true }),
  ]);

  if (versionRes.error) throw versionRes.error;
  if (!versionRes.data) return null;

  const sections = (sectionsRes.data ?? []).map(mapSection);
  const questions = (aqRes.data ?? []).map((row) => {
    const options = (row.questions.question_options ?? [])
      .slice()
      .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
      .map(mapQuestionOption);
    const question = mapQuestion(row.questions, options);
    return mapAssessmentQuestion(row, question);
  });

  const version = buildVersion(
    versionRes.data,
    sections,
    questions,
    (dimsRes.data ?? []).map(mapScoringDimension),
    (rulesRes.data ?? []).map(mapScoringRule),
    (rangesRes.data ?? []).map(mapResultRange)
  );

  const assessment = mapAssessment(
    assessmentRow,
    assessmentRow.assessment_categories ? mapCategory(assessmentRow.assessment_categories) : undefined
  );

  return { ...assessment, version };
}
