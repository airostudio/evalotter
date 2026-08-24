import type {
  Assessment,
  AssessmentCategory,
  AssessmentQuestion,
  AssessmentResponse,
  AssessmentSection,
  AssessmentVersion,
  Question,
  QuestionOption,
  ResultRange,
  ScoringDimension,
  ScoringRule,
} from "@/types";

// Thin snake_case -> camelCase mappers between Supabase rows and domain
// types. Kept centralized so query functions stay readable and the
// (currently loosely-typed) Supabase client doesn't leak `any` shapes
// into the rest of the app.

type Row = any;

export function mapCategory(row: Row): AssessmentCategory {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    description: row.description,
    icon: row.icon,
    order: row.order,
  };
}

export function mapAssessment(row: Row, category?: AssessmentCategory): Assessment {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description,
    longDescription: row.long_description,
    icon: row.icon,
    coverImageUrl: row.cover_image_url,
    categoryId: row.category_id,
    category,
    engineType: row.engine_type,
    difficulty: row.difficulty,
    estimatedDurationMinutes: row.estimated_duration_minutes,
    questionCount: row.question_count,
    featured: row.featured,
    access: row.access,
    status: row.status,
    currentVersionId: row.current_version_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapQuestionOption(row: Row): QuestionOption {
  return {
    id: row.id,
    questionId: row.question_id,
    label: row.label,
    value: row.value,
    imageUrl: row.image_url,
    isCorrect: row.is_correct,
    order: row.order,
    scoreConfig: row.score_config,
  };
}

export function mapQuestion(row: Row, options: QuestionOption[] = []): Question {
  return {
    id: row.id,
    questionType: row.question_type,
    questionText: row.question_text,
    instructions: row.instructions,
    media: row.media,
    options,
    correctAnswer: row.correct_answer,
    scoreConfig: row.score_config,
    difficulty: row.difficulty,
    category: row.category,
    tags: row.tags,
    timeLimitSeconds: row.time_limit_seconds,
    required: row.required,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAssessmentQuestion(row: Row, question: Question): AssessmentQuestion {
  return {
    id: row.id,
    assessmentVersionId: row.assessment_version_id,
    sectionId: row.section_id,
    questionId: row.question_id,
    question,
    order: row.order,
    weight: Number(row.weight),
    conditional: row.conditional,
  };
}

export function mapSection(row: Row): AssessmentSection {
  return {
    id: row.id,
    assessmentVersionId: row.assessment_version_id,
    name: row.name,
    description: row.description,
    instructions: row.instructions,
    timeLimitSeconds: row.time_limit_seconds,
    randomizeQuestions: row.randomize_questions,
    questionCount: row.question_count,
    weight: Number(row.weight),
    order: row.order,
  };
}

export function mapScoringDimension(row: Row): ScoringDimension {
  return {
    id: row.id,
    assessmentId: row.assessment_id,
    key: row.key,
    label: row.label,
    description: row.description,
    contributesToBrainProfile: row.contributes_to_brain_profile,
    brainProfileDimensionKey: row.brain_profile_dimension_key,
    order: row.order,
  };
}

export function mapScoringRule(row: Row): ScoringRule {
  return {
    id: row.id,
    assessmentVersionId: row.assessment_version_id,
    dimensionKey: row.dimension_key,
    formula: row.formula,
    sectionWeights: row.section_weights,
    timeBonus: row.time_bonus,
    penaltyPerIncorrect: row.penalty_per_incorrect,
    normalization: row.normalization,
  };
}

export function mapResultRange(row: Row): ResultRange {
  return {
    id: row.id,
    assessmentId: row.assessment_id,
    dimensionKey: row.dimension_key,
    minScore: Number(row.min_score),
    maxScore: Number(row.max_score),
    title: row.title,
    description: row.description,
    recommendations: row.recommendations,
    icon: row.icon,
    aiPromptFragment: row.ai_prompt_fragment,
    order: row.order,
  };
}

export function mapResponse(row: Row): AssessmentResponse {
  return {
    id: row.id,
    attemptId: row.attempt_id,
    questionId: row.question_id,
    sectionId: row.section_id,
    answer: row.answer,
    isCorrect: row.is_correct,
    responseTimeMs: row.response_time_ms,
    answeredAt: row.answered_at,
  };
}

export function buildVersion(
  versionRow: Row,
  sections: AssessmentSection[],
  questions: AssessmentQuestion[],
  scoringDimensions: ScoringDimension[],
  scoringRules: ScoringRule[],
  resultRanges: ResultRange[]
): AssessmentVersion {
  return {
    id: versionRow.id,
    assessmentId: versionRow.assessment_id,
    versionNumber: versionRow.version_number,
    status: versionRow.status,
    publishedAt: versionRow.published_at,
    sections,
    questions,
    scoringDimensions,
    scoringRules,
    resultRanges,
    settings: {
      allowBackNavigation: true,
      randomizeSections: false,
      randomizeQuestions: false,
      randomizeAnswerOrder: false,
      showProgressBar: true,
      showInstructionsBetweenSections: true,
      autosaveIntervalSeconds: 5,
      ...(versionRow.settings ?? {}),
    },
  };
}
