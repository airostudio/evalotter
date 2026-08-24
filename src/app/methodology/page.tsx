import type { Metadata } from "next";
import { SimplePageHeader } from "@/components/marketing/SimplePageHeader";

export const metadata: Metadata = { title: "Methodology" };

const FRAMEWORKS = [
  { assessment: "Emotional Intelligence", basis: "EQ-i 2.0 and MSCEIT frameworks, across nine EQ dimensions." },
  { assessment: "Verbal Intelligence", basis: "Structured after the Wechsler Adult Intelligence Scale (WAIS) verbal subtests." },
  { assessment: "Memory Recall", basis: "Adapted from ISLT, ADAS-Cog word recall, and Logical Memory-style exercises." },
  { assessment: "Verbal Reasoning", basis: "GRE Verbal / LSAT Logical Reasoning-calibre comprehension and inference items." },
  { assessment: "Logical Reasoning", basis: "Pattern detection, deduction and sequence-completion items in the Mensa-style tradition." },
  { assessment: "Spatial Intelligence", basis: "2D/3D rotation, orientation and transformation matrices, SVG-rendered." },
];

export default function MethodologyPage() {
  return (
    <div>
      <SimplePageHeader
        eyebrow="Methodology"
        title="Real frameworks, transparent scoring"
        lede="Every EvalOtter assessment is grounded in an established methodology and scored by rules you could read yourself — never a black box."
      />

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <section>
          <h2 className="font-display text-xl text-paper-100">Deterministic scoring, always</h2>
          <p className="mt-3 leading-relaxed text-paper-100/60">
            Every response maps to points on one or more scoring dimensions through rules defined
            in advance — sums, weighted sums, averages, or normalized 0–100 conversions, all
            configurable per assessment. AI never assigns a score; it only interprets a score that
            has already been computed. This separation is enforced at the data layer: calculated
            results and AI interpretations are stored in different tables.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-xl text-paper-100">What each assessment draws on</h2>
          <div className="mt-5 flex flex-col divide-y divide-ink-700 rounded-xl2 border border-ink-700">
            {FRAMEWORKS.map((f) => (
              <div key={f.assessment} className="grid gap-1 p-5 sm:grid-cols-[220px_1fr] sm:gap-6">
                <span className="font-medium text-paper-100">{f.assessment}</span>
                <span className="text-sm text-paper-100/60">{f.basis}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-xl text-paper-100">Not a diagnosis</h2>
          <p className="mt-3 leading-relaxed text-paper-100/60">
            EvalOtter assessments are designed for education, entertainment and self-discovery and
            are not a substitute for professional psychological, medical or clinical assessment.
            Palmistry in particular is offered purely for entertainment and self-reflection.
          </p>
        </section>
      </div>
    </div>
  );
}
