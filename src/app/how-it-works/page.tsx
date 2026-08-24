import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SimplePageHeader } from "@/components/marketing/SimplePageHeader";

export const metadata: Metadata = { title: "How it works" };

const STEPS = [
  {
    title: "1. Choose an assessment",
    body: "Browse the catalogue by category — cognitive, memory, emotional, spatial, creative and more — or start with the flagship EvalOtter Intelligence Profile for a broad first read.",
  },
  {
    title: "2. Complete it at your pace",
    body: "Each assessment autosaves as you go. Close the tab and come back later — you'll resume exactly where you left off, right down to the question.",
  },
  {
    title: "3. Deterministic scoring, instantly",
    body: "Your responses run through a transparent, admin-configured scoring engine — raw points, weighted formulas, and normalized 0–100 scores per dimension. No black boxes.",
  },
  {
    title: "4. A report worth reading",
    body: "See your score visualized with radar and bar charts, strengths and development areas, and — where enabled — an AI-generated interpretation written after your score is already final.",
  },
  {
    title: "5. Your Brain Profile grows",
    body: "Every completed assessment feeds My Brain Profile according to explicit contribution rules — so unrelated content (like Palmistry) never distorts your cognitive score.",
  },
];

export default function HowItWorksPage() {
  return (
    <div>
      <SimplePageHeader
        eyebrow="How it works"
        title="From first click to a real profile"
        lede="EvalOtter is built around one idea: assessments should feel considered, not gamified — and your results should mean something over time."
      />

      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-10">
          {STEPS.map((step) => (
            <div key={step.title}>
              <h2 className="font-display text-xl text-paper-100">{step.title}</h2>
              <p className="mt-2 leading-relaxed text-paper-100/60">{step.body}</p>
            </div>
          ))}
        </div>

        <Link
          href="/assessments"
          className="focus-ring mt-12 inline-flex min-h-[48px] items-center gap-2 rounded-xl2 bg-signal-violet px-7 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Explore assessments <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
