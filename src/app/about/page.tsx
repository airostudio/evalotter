import type { Metadata } from "next";
import { SimplePageHeader } from "@/components/marketing/SimplePageHeader";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div>
      <SimplePageHeader
        eyebrow="About"
        title="Built for people who want to understand themselves better"
      />

      <div className="mx-auto max-w-2xl px-4 py-16 text-paper-100/65 sm:px-6">
        <p className="leading-relaxed">
          Brainyak started from a simple frustration: most online quizzes optimize for virality,
          not insight. They hard-code a single test, throw a score at you, and move on. We wanted
          something different — a platform built to grow, where every assessment you take adds to
          a single, evolving picture of how you think, feel, and create.
        </p>
        <p className="mt-5 leading-relaxed">
          That meant building the assessment engine itself to be extensible from day one:
          questions, scoring, and result interpretation are all data, not code, so new assessments
          can launch without a rebuild. It also meant being disciplined about what a score can and
          can&apos;t claim — every Brainyak assessment is designed for education, entertainment and
          self-discovery, not as a clinical or diagnostic tool.
        </p>
        <p className="mt-5 leading-relaxed">
          We&apos;re early, and the catalogue will keep growing. If there&apos;s an assessment
          you&apos;d like to see, we&apos;d love to hear about it.
        </p>
      </div>
    </div>
  );
}
