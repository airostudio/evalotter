import type { Metadata } from "next";
import { CATALOGUE, CATEGORY_LABELS, type CatalogueAssessment } from "@/config/catalogue";
import { listCatalogueAssessments } from "@/lib/assessment-engine/queries";
import { CatalogueBrowser } from "@/components/marketing/CatalogueBrowser";

export const metadata: Metadata = {
  title: "Assessment Catalogue",
  description: "Browse every EvalOtter assessment, filterable by category.",
};

export const revalidate = 60;

async function getCatalogueData(): Promise<CatalogueAssessment[]> {
  try {
    const assessments = await listCatalogueAssessments();
    if (assessments.length === 0) return CATALOGUE;

    return assessments.map((a) => ({
      slug: a.slug,
      title: a.title,
      shortDescription: a.shortDescription,
      category: a.category?.label ?? "General",
      categoryKey: a.category?.key ?? "general",
      icon: a.icon,
      engineType: a.engineType,
      difficulty: a.difficulty,
      estimatedDurationMinutes: a.estimatedDurationMinutes,
      questionCount: a.questionCount,
      access: a.access,
      featured: a.featured,
      comingSoon: a.status === "coming_soon",
    }));
  } catch {
    // Supabase not configured/seeded yet in this environment — fall back
    // to the static catalogue so the page still renders meaningfully.
    return CATALOGUE;
  }
}

export default async function AssessmentsPage() {
  const assessments = await getCatalogueData();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="max-w-2xl">
        <span className="text-xs uppercase tracking-widest text-signal-cyan/80">Catalogue</span>
        <h1 className="mt-3 font-display text-4xl text-paper-100">Every assessment, in one place</h1>
        <p className="mt-4 text-paper-100/60">
          Filter by category to find the right assessment, or start with the EvalOtter Intelligence
          Profile for a complete picture.
        </p>
      </div>

      <CatalogueBrowser assessments={assessments} categoryLabels={CATEGORY_LABELS} />
    </div>
  );
}
