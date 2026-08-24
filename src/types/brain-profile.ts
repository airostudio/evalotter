export interface BrainProfileDimension {
  key: string;
  label: string;
  score: number | null;
  previousScore?: number | null;
  contributingAssessmentSlugs: string[];
  lastUpdatedAt?: string | null;
}

export interface UserBrainProfile {
  userId: string;
  brainyakScore: number | null;
  assessmentsCompleted: number;
  assessmentsTotal: number;
  strongestDimensionKey?: string | null;
  weakestDimensionKey?: string | null;
  dimensions: BrainProfileDimension[];
  updatedAt: string;
}
