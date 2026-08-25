"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { AssessmentCard } from "./AssessmentCard";
import type { CatalogueAssessment } from "@/config/catalogue";

export function CatalogueBrowser({
  assessments,
  categoryLabels,
}: {
  assessments: CatalogueAssessment[];
  categoryLabels: Record<string, string>;
}) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const keys = new Set(assessments.map((a) => a.categoryKey));
    return ["all", ...[...keys]];
  }, [assessments]);

  const filtered = [
    ...(activeCategory === "all" ? assessments : assessments.filter((a) => a.categoryKey === activeCategory)),
  ].sort((a, b) => Number(Boolean(a.comingSoon)) - Number(Boolean(b.comingSoon)));

  return (
    <div>
      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {categories.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveCategory(key)}
            className={clsx(
              "focus-ring rounded-full border px-4 py-2 text-sm transition-colors",
              activeCategory === key
                ? "border-signal-cyan/70 bg-signal-cyan/10 text-paper-100"
                : "border-ink-600 text-paper-100/60 hover:border-ink-500"
            )}
          >
            {key === "all" ? "All" : categoryLabels[key] ?? key}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((assessment) => (
          <AssessmentCard key={assessment.slug} assessment={assessment} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-paper-100/50">No assessments in this category yet.</p>
      )}
    </div>
  );
}
