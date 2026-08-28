import type { AssessmentAccess, AssessmentEngineType } from "@/types";

/**
 * Static display metadata for the launch assessments plus roadmap
 * ("coming soon") entries. This mirrors `scripts/seed/data/*.json` and
 * exists so the marketing site (homepage, catalogue) can render
 * meaningfully even before a Supabase project is provisioned/seeded — the
 * catalogue page prefers live DB data and only falls back to this when the
 * database is empty or unreachable.
 */
export interface CatalogueAssessment {
  slug: string;
  title: string;
  shortDescription: string;
  category: string;
  categoryKey: string;
  icon: string;
  engineType: AssessmentEngineType;
  difficulty: "easy" | "medium" | "hard";
  estimatedDurationMinutes: number;
  questionCount: number;
  access: AssessmentAccess;
  featured?: boolean;
  /** On the public roadmap but not yet authored — shown in the catalogue as a teaser, never startable. */
  comingSoon?: boolean;
}

export const CATEGORY_ORDER = [
  "cognitive",
  "logical",
  "memory",
  "numerical",
  "language",
  "emotional",
  "spatial",
  "creative",
  "self-discovery",
  "ai-analysis",
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  cognitive: "Cognitive",
  logical: "Logical",
  memory: "Memory",
  numerical: "Numerical",
  language: "Language",
  emotional: "Emotional",
  spatial: "Spatial",
  creative: "Creative",
  "self-discovery": "Self Discovery",
  "ai-analysis": "AI Analysis",
};

export const CATALOGUE: CatalogueAssessment[] = [
  {
    slug: "intelligence-profile",
    title: "EvalOtter Intelligence Profile",
    shortDescription:
      "The flagship assessment. Combines logical reasoning, numerical intelligence, memory, verbal reasoning, spatial intelligence, and pattern recognition into one EvalOtter Score.",
    category: "Cognitive",
    categoryKey: "cognitive",
    icon: "brain",
    engineType: "hybrid",
    difficulty: "medium",
    estimatedDurationMinutes: 25,
    questionCount: 30,
    access: "free",
    featured: true,
  },
  {
    slug: "logical-reasoning",
    title: "Logical Reasoning",
    shortDescription:
      "Pattern detection, deduction, sequences and abstract reasoning — measured the way GRE and LSAT logic sections do.",
    category: "Logical",
    categoryKey: "logical",
    icon: "git-branch",
    engineType: "standard_questionnaire",
    difficulty: "medium",
    estimatedDurationMinutes: 15,
    questionCount: 20,
    access: "free",
  },
  {
    slug: "memory-recall",
    title: "Memory Recall",
    shortDescription:
      "Word, image and number-sequence recall exercises adapted from clinical memory tests like ISLT and ADAS-Cog word recall.",
    category: "Memory",
    categoryKey: "memory",
    icon: "sparkles",
    engineType: "memory_exercise",
    difficulty: "medium",
    estimatedDurationMinutes: 12,
    questionCount: 15,
    access: "free",
  },
  {
    slug: "verbal-reasoning",
    title: "Verbal Reasoning",
    shortDescription:
      "Comprehension, analogies, inference and argument evaluation — GRE Verbal / LSAT Logical Reasoning calibre.",
    category: "Language",
    categoryKey: "language",
    icon: "message-square",
    engineType: "timed_questionnaire",
    difficulty: "hard",
    estimatedDurationMinutes: 18,
    questionCount: 24,
    access: "free",
  },
  {
    slug: "palmistry",
    title: "Palmistry",
    shortDescription:
      "Photograph both palms and receive a personalised, AI-generated reading. Entertainment and self-reflection only.",
    category: "Self Discovery",
    categoryKey: "self-discovery",
    icon: "hand",
    engineType: "vision_analysis",
    difficulty: "easy",
    estimatedDurationMinutes: 5,
    questionCount: 4,
    access: "free",
  },
  {
    slug: "emotional-intelligence",
    title: "Emotional Intelligence",
    shortDescription:
      "Self-awareness, self-regulation, empathy, social awareness and relationship management, based on EQ-i 2.0 and MSCEIT frameworks.",
    category: "Emotional",
    categoryKey: "emotional",
    icon: "heart-handshake",
    engineType: "standard_questionnaire",
    difficulty: "medium",
    estimatedDurationMinutes: 15,
    questionCount: 40,
    access: "free",
  },
  {
    slug: "metrics",
    title: "Metrics / Numerical Intelligence",
    shortDescription:
      "Numerical reasoning, percentages, ratios, sequences and data interpretation under light time pressure.",
    category: "Numerical",
    categoryKey: "numerical",
    icon: "calculator",
    engineType: "timed_questionnaire",
    difficulty: "medium",
    estimatedDurationMinutes: 15,
    questionCount: 20,
    access: "free",
  },
  {
    slug: "spatial-intelligence",
    title: "Spatial Intelligence",
    shortDescription:
      "Rotation, orientation, shape matching and 2D/3D transformations using SVG-based visual reasoning matrices.",
    category: "Spatial",
    categoryKey: "spatial",
    icon: "box",
    engineType: "pattern_recognition",
    difficulty: "hard",
    estimatedDurationMinutes: 15,
    questionCount: 18,
    access: "free",
  },
  {
    slug: "verbal-intelligence",
    title: "Verbal Intelligence",
    shortDescription:
      "Vocabulary, comprehension, similarities and general information, based on the Wechsler Adult Intelligence Scale (WAIS).",
    category: "Language",
    categoryKey: "language",
    icon: "book-open",
    engineType: "standard_questionnaire",
    difficulty: "medium",
    estimatedDurationMinutes: 12,
    questionCount: 15,
    access: "free",
  },
  {
    slug: "creative-assessment",
    title: "Creative Assessment",
    shortDescription:
      "Divergent thinking, originality, flexibility and problem reframing, with open-text responses and AI-assisted interpretation.",
    category: "Creative",
    categoryKey: "creative",
    icon: "palette",
    engineType: "hybrid",
    difficulty: "medium",
    estimatedDurationMinutes: 15,
    questionCount: 15,
    access: "free",
  },

  // ---------------------------------------------------------------------
  // Coming soon — on the roadmap, not yet authored. No DB content behind
  // these; the catalogue shows them as a teaser with no Start button.
  // ---------------------------------------------------------------------
  {
    slug: "verbal-reasoning-mastery",
    title: "Verbal Reasoning Mastery",
    shortDescription: "An advanced-tier follow-on to Verbal Reasoning, pushing into denser passages and multi-step argument chains.",
    category: "Language", categoryKey: "language", icon: "message-square",
    engineType: "timed_questionnaire", difficulty: "hard", estimatedDurationMinutes: 25, questionCount: 30, access: "premium",
  },
  {
    slug: "memory-palace-challenge",
    title: "Memory Palace Challenge",
    shortDescription: "A method-of-loci memory exercise — place items along an imagined route, then recall them in order.",
    category: "Memory", categoryKey: "memory", icon: "map",
    engineType: "memory_exercise", difficulty: "hard", estimatedDurationMinutes: 15, questionCount: 12, access: "premium", comingSoon: true,
  },
  {
    slug: "critical-thinking-depth",
    title: "Critical Thinking Depth",
    shortDescription: "Evaluate arguments for hidden assumptions, unstated premises, and reasoning under incomplete information.",
    category: "Logical", categoryKey: "logical", icon: "layers",
    engineType: "standard_questionnaire", difficulty: "hard", estimatedDurationMinutes: 20, questionCount: 20, access: "free",
  },
  {
    slug: "numerical-agility",
    title: "Numerical Agility",
    shortDescription: "Rapid-fire mental math and estimation under a tight clock — built for speed as much as accuracy.",
    category: "Numerical", categoryKey: "numerical", icon: "zap",
    engineType: "timed_questionnaire", difficulty: "medium", estimatedDurationMinutes: 10, questionCount: 24, access: "free",
  },
  {
    slug: "creative-divergent-thinking",
    title: "Creative Divergent Thinking",
    shortDescription: "Alternative-uses and idea-fluency tasks that measure how many genuinely different directions you can generate.",
    category: "Creative", categoryKey: "creative", icon: "shuffle",
    engineType: "hybrid", difficulty: "medium", estimatedDurationMinutes: 15, questionCount: 10, access: "premium", comingSoon: true,
  },
  {
    slug: "speed-processing-index",
    title: "Speed Processing Index",
    shortDescription: "Simple, low-difficulty tasks answered as fast as possible — an index of raw cognitive processing speed.",
    category: "Cognitive", categoryKey: "cognitive", icon: "timer",
    engineType: "timed_questionnaire", difficulty: "easy", estimatedDurationMinutes: 8, questionCount: 40, access: "free", comingSoon: true,
  },
  {
    slug: "phonological-awareness",
    title: "Phonological Awareness",
    shortDescription: "Rhyme, syllable, and sound-manipulation tasks measuring how you perceive and work with the sounds of language.",
    category: "Language", categoryKey: "language", icon: "volume-2",
    engineType: "standard_questionnaire", difficulty: "medium", estimatedDurationMinutes: 12, questionCount: 24, access: "free",
  },
  {
    slug: "executive-function-profiling",
    title: "Executive Function Profiling",
    shortDescription: "Planning, inhibition, working memory, and task-switching — the control processes behind goal-directed behavior.",
    category: "Cognitive", categoryKey: "cognitive", icon: "layers",
    engineType: "hybrid", difficulty: "hard", estimatedDurationMinutes: 20, questionCount: 24, access: "premium", comingSoon: true,
  },
  {
    slug: "visuospatial-rotation",
    title: "Visuospatial Rotation",
    shortDescription: "Mental rotation of 3D objects — identify which option is the same shape rotated, not a mirrored fake.",
    category: "Spatial", categoryKey: "spatial", icon: "rotate-cw",
    engineType: "pattern_recognition", difficulty: "hard", estimatedDurationMinutes: 15, questionCount: 18, access: "premium", comingSoon: true,
  },
  {
    slug: "auditory-processing-speed",
    title: "Auditory Processing Speed",
    shortDescription: "How quickly and accurately you process spoken information — sequences, tones, and rapid verbal instructions.",
    category: "Cognitive", categoryKey: "cognitive", icon: "ear",
    engineType: "timed_questionnaire", difficulty: "medium", estimatedDurationMinutes: 12, questionCount: 20, access: "premium", comingSoon: true,
  },
  {
    slug: "attention-control-test",
    title: "Attention Control Test",
    shortDescription: "Sustained focus and selective attention under distraction — a Stroop-style interference task.",
    category: "Cognitive", categoryKey: "cognitive", icon: "eye",
    engineType: "timed_questionnaire", difficulty: "medium", estimatedDurationMinutes: 10, questionCount: 30, access: "free", comingSoon: true,
  },
  {
    slug: "abstract-reasoning-pro",
    title: "Abstract Reasoning Pro",
    shortDescription: "Advanced non-verbal matrix reasoning beyond Spatial Intelligence — denser rule sets, higher ceiling.",
    category: "Logical", categoryKey: "logical", icon: "box",
    engineType: "pattern_recognition", difficulty: "hard", estimatedDurationMinutes: 20, questionCount: 20, access: "premium", comingSoon: true,
  },
  {
    slug: "decision-making-under-pressure",
    title: "Decision Making Under Pressure",
    shortDescription: "Scenario-based judgment tasks with a ticking clock and incomplete information — how you decide, not just what.",
    category: "Cognitive", categoryKey: "cognitive", icon: "timer",
    engineType: "timed_questionnaire", difficulty: "hard", estimatedDurationMinutes: 15, questionCount: 15, access: "premium",
  },
  {
    slug: "cognitive-flexibility-index",
    title: "Cognitive Flexibility Index",
    shortDescription: "Task-switching and rule-reversal exercises measuring how easily you adapt when the rules change mid-task.",
    category: "Cognitive", categoryKey: "cognitive", icon: "shuffle",
    engineType: "hybrid", difficulty: "medium", estimatedDurationMinutes: 12, questionCount: 20, access: "free", comingSoon: true,
  },
  {
    slug: "language-acquisition",
    title: "Language Acquisition",
    shortDescription: "How readily you infer grammar and meaning from an unfamiliar constructed mini-language — a language-learning aptitude measure.",
    category: "Language", categoryKey: "language", icon: "book-open",
    engineType: "standard_questionnaire", difficulty: "hard", estimatedDurationMinutes: 20, questionCount: 20, access: "premium",
  },
  {
    slug: "social-cognition-assessment",
    title: "Social Cognition Assessment",
    shortDescription: "Reading intentions, perspective-taking, and interpreting social scenarios — the cognitive side of understanding people.",
    category: "Emotional", categoryKey: "emotional", icon: "users",
    engineType: "standard_questionnaire", difficulty: "medium", estimatedDurationMinutes: 15, questionCount: 20, access: "free",
  },
  {
    slug: "fluid-intelligence-peak",
    title: "Fluid Intelligence Peak",
    shortDescription: "Novel-problem reasoning with no reliance on prior knowledge — solving patterns you've genuinely never seen before.",
    category: "Logical", categoryKey: "logical", icon: "brain",
    engineType: "pattern_recognition", difficulty: "hard", estimatedDurationMinutes: 25, questionCount: 25, access: "premium", comingSoon: true,
  },
  {
    slug: "career-aptitude-profile",
    title: "Career Aptitude Profile",
    shortDescription: "Maps your Brain Profile strengths and interests against career directions likely to suit how you think.",
    category: "Self Discovery", categoryKey: "self-discovery", icon: "compass",
    engineType: "hybrid", difficulty: "easy", estimatedDurationMinutes: 15, questionCount: 30, access: "premium",
  },
  {
    slug: "full-iq-estimation-report",
    title: "Full IQ Estimation Report",
    shortDescription: "A comprehensive, multi-battery composite drawing on every completed assessment to estimate a full-scale IQ range.",
    category: "AI Analysis", categoryKey: "ai-analysis", icon: "file-text",
    engineType: "ai_analysis", difficulty: "hard", estimatedDurationMinutes: 45, questionCount: 60, access: "premium", comingSoon: true,
  },
];
