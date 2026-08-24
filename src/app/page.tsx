import Link from "next/link";
import { ArrowRight, CheckCircle2, ScanEye, ShieldCheck, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/ui/FadeIn";
import { AssessmentCard } from "@/components/marketing/AssessmentCard";
import { RadarChartCard } from "@/components/charts/RadarChartCard";
import { CATALOGUE, CATEGORY_LABELS } from "@/config/catalogue";

const EXAMPLE_PROFILE = [
  { dimension: "Logical", score: 87 },
  { dimension: "Memory", score: 74 },
  { dimension: "Verbal", score: 91 },
  { dimension: "Emotional", score: 82 },
  { dimension: "Spatial", score: 68 },
  { dimension: "Creative", score: 94 },
];

const WHY_DIFFERENT = [
  {
    title: "Database-driven, never hard-coded",
    body: "Every assessment — question, section, scoring rule, result range — is data. New assessments launch without touching a line of code.",
    icon: Sparkles,
  },
  {
    title: "Deterministic scoring, AI interpretation",
    body: "Scores are always computed by transparent, configurable rules. AI only interprets what's already been measured — it never invents a number.",
    icon: ShieldCheck,
  },
  {
    title: "One profile, not ten disconnected quizzes",
    body: "Every assessment you complete enriches a single Brain Profile, with clear rules for what does — and doesn't — feed each dimension.",
    icon: ScanEye,
  },
];

const STEPS = [
  { title: "Choose an assessment", body: "Pick from the catalogue, filtered by category, duration or difficulty." },
  { title: "Complete it at your pace", body: "Autosave and resume-later mean you're never rushed or locked in." },
  { title: "Get a real report", body: "Deterministic scoring, visual breakdowns, and an AI-written interpretation." },
  { title: "Watch your profile grow", body: "Each result enriches My Brain Profile — your evolving picture of how you think." },
];

const FAQS = [
  {
    q: "Is EvalOtter a medical or psychological diagnosis?",
    a: "No. EvalOtter assessments are designed for education, entertainment and self-discovery and are not a substitute for professional psychological, medical or clinical assessment.",
  },
  {
    q: "How is my score calculated?",
    a: "Every assessment uses a deterministic, admin-configurable scoring engine — raw points, weights and normalization are defined in advance. AI is only used afterwards, to interpret a score it did not set.",
  },
  {
    q: "Can I retake an assessment?",
    a: "Yes. Retaking is always available, and your Brain Profile keeps a history so you can compare attempts over time.",
  },
  {
    q: "What happens to my Palmistry photos?",
    a: "They're stored privately, visible only to you, and you can delete them at any time from your account. Palmistry results are for entertainment and self-reflection only.",
  },
];

export default function HomePage() {
  const featured = CATALOGUE.find((a) => a.featured) ?? CATALOGUE[0]!;
  const rest = CATALOGUE.filter((a) => a.slug !== featured.slug).slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink-700/60">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(124,92,255,0.18),transparent_45%),radial-gradient(circle_at_85%_10%,rgba(92,225,230,0.12),transparent_40%)]" />
        <div className="relative mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <FadeIn>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-600 px-3 py-1 text-xs text-paper-100/60">
              <Sparkles className="h-3.5 w-3.5 text-signal-cyan" /> Ten assessments. One evolving profile.
            </span>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1 className="mt-6 font-display text-4xl leading-[1.1] text-paper-100 sm:text-6xl">
              Discover How Your Mind Works
            </h1>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-paper-100/65">
              Measure your reasoning, memory, emotional intelligence, creativity, spatial thinking
              and more through interactive assessments designed to reveal how you think.
            </p>
          </FadeIn>
          <FadeIn delay={0.24}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/assessments"
                className="focus-ring flex min-h-[52px] items-center gap-2 rounded-xl2 bg-signal-violet px-7 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Explore Assessments <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/brain-profile"
                className="focus-ring flex min-h-[52px] items-center rounded-xl2 border border-ink-600 px-7 text-sm font-medium text-paper-100 transition-colors hover:border-ink-400"
              >
                Build My Brain Profile
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Featured EvalOtter Intelligence Profile */}
      <section className="border-b border-ink-700/60 bg-ink-900/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
          <FadeIn>
            <span className="text-xs uppercase tracking-widest text-signal-cyan/80">Flagship assessment</span>
            <h2 className="mt-3 font-display text-3xl text-paper-100">{featured.title}</h2>
            <p className="mt-4 max-w-lg text-paper-100/65">{featured.shortDescription}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-paper-100/50">
              <span>{featured.estimatedDurationMinutes} minutes</span>
              <span>·</span>
              <span>{featured.questionCount} questions</span>
              <span>·</span>
              <span>Free</span>
            </div>
            <Link
              href={`/assessments/${featured.slug}`}
              className="focus-ring mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-xl2 bg-signal-violet px-6 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Take the EvalOtter Profile <ArrowRight className="h-4 w-4" />
            </Link>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="rounded-xl2 border border-ink-700 bg-ink-800/50 p-6 shadow-panel">
              <p className="mb-2 text-xs uppercase tracking-wide text-paper-100/40">Example profile</p>
              <RadarChartCard data={EXAMPLE_PROFILE} color="#7c5cff" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Assessment categories / cards */}
      <section className="border-b border-ink-700/60">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl text-paper-100">Ten assessments, and counting</h2>
            <p className="mt-3 text-paper-100/60">
              Administrators can publish new assessments at any time — the platform is built to
              grow without a rebuild.
            </p>
          </FadeIn>

          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {Object.values(CATEGORY_LABELS).map((label) => (
              <span
                key={label}
                className="rounded-full border border-ink-600 px-3.5 py-1.5 text-xs text-paper-100/60"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((assessment) => (
              <AssessmentCard key={assessment.slug} assessment={assessment} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/assessments"
              className="focus-ring inline-flex items-center gap-1.5 text-sm font-medium text-signal-cyan hover:opacity-80"
            >
              View the full catalogue <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-ink-700/60 bg-ink-900/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <FadeIn className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-3xl text-paper-100">How it works</h2>
          </FadeIn>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <FadeIn key={step.title} delay={i * 0.06}>
                <span className="font-display text-3xl text-signal-cyan/70">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-paper-100">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-paper-100/55">{step.body}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Why EvalOtter is different */}
      <section className="border-b border-ink-700/60">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <FadeIn className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-3xl text-paper-100">Why EvalOtter is different</h2>
          </FadeIn>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {WHY_DIFFERENT.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.08}>
                <item.icon className="h-6 w-6 text-signal-violet" />
                <h3 className="mt-4 text-paper-100">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-paper-100/55">{item.body}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology / trust */}
      <section className="border-b border-ink-700/60 bg-ink-900/40">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <FadeIn>
            <h2 className="font-display text-3xl text-paper-100">Built on real methodology</h2>
            <p className="mx-auto mt-4 max-w-2xl text-paper-100/60">
              Assessments draw on established frameworks — EQ-i 2.0 and MSCEIT for emotional
              intelligence, WAIS for verbal intelligence, ISLT and ADAS-Cog for memory — adapted
              into an engaging, interactive format. Every scoring rule is transparent and
              admin-configurable, never a black box.
            </p>
            <Link
              href="/methodology"
              className="focus-ring mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-signal-cyan hover:opacity-80"
            >
              Read our methodology <ArrowRight className="h-4 w-4" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Testimonials placeholder */}
      <section className="border-b border-ink-700/60">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <FadeIn className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-3xl text-paper-100">What early users say</h2>
          </FadeIn>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div className="h-full rounded-xl2 border border-ink-700 bg-ink-800/40 p-6">
                  <div className="h-3 w-24 rounded bg-ink-600" />
                  <div className="mt-4 space-y-2">
                    <div className="h-2.5 w-full rounded bg-ink-700" />
                    <div className="h-2.5 w-5/6 rounded bg-ink-700" />
                    <div className="h-2.5 w-3/4 rounded bg-ink-700" />
                  </div>
                  <div className="mt-5 h-2 w-20 rounded bg-ink-700" />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-ink-700/60 bg-ink-900/40">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <FadeIn className="text-center">
            <h2 className="font-display text-3xl text-paper-100">Frequently asked questions</h2>
          </FadeIn>
          <div className="mt-10 flex flex-col gap-3">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl2 border border-ink-700 bg-ink-800/40 px-5 py-4 open:border-ink-500"
              >
                <summary className="focus-ring flex cursor-pointer list-none items-center justify-between text-sm font-medium text-paper-100">
                  {faq.q}
                  <CheckCircle2 className="h-4 w-4 text-paper-100/20 transition-colors group-open:text-signal-cyan" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-paper-100/60">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
          <FadeIn>
            <h2 className="font-display text-3xl text-paper-100 sm:text-4xl">
              Ready to see how your mind works?
            </h2>
            <Link
              href="/assessments"
              className="focus-ring mt-8 inline-flex min-h-[52px] items-center gap-2 rounded-xl2 bg-signal-violet px-8 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Explore Assessments <ArrowRight className="h-4 w-4" />
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
