import type { AssessmentAccess, AssessmentEngineType } from "@/types";

/**
 * Static display metadata for the ten launch assessments. This mirrors
 * `supabase/seed.sql` and exists so the marketing site (homepage,
 * catalogue) can render meaningfully even before a Supabase project is
 * provisioned/seeded — the catalogue page prefers live DB data and only
 * falls back to this when the database is empty or unreachable.
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
    slug: "brainyak",
    title: "Brainyak Intelligence Profile",
    shortDescription:
      "The flagship assessment. Combines logical reasoning, numerical intelligence, memory, verbal reasoning, spatial intelligence, and pattern recognition into one Brainyak Score.",
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
];
