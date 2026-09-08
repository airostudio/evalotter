import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Clock, ListChecks, Lock, ShieldCheck, Signal, Sparkles } from "lucide-react";
import { CATALOGUE } from "@/config/catalogue";
import { getAssessmentDetail } from "@/config/assessment-details";
import { AssessmentIcon } from "@/components/ui/AssessmentIcon";
import { getAssessmentWithVersionBySlug } from "@/lib/assessment-engine/queries";
import { getCurrentUser } from "@/lib/auth/current-user";
import { startOrResumeAttemptAction } from "@/actions/attempts";
import { AssessmentStartGate } from "@/components/assessment/AssessmentStartGate";
import { QUESTION_FORMAT_LABELS } from "@/config/question-formats";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const fallback = CATALOGUE.find((a) => a.slug === slug);
  if (!fallback) return { title: "Assessment" };
  return { title: fallback.title, description: fallback.shortDescription };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-xs uppercase tracking-widest text-paper-100/40">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function minutes(seconds: number | null): string | null {
  if (!seconds) return null;
  return seconds >= 60 ? `${Math.round(seconds / 60)} min` : `${seconds}s`;
}

export default async function AssessmentDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();

  let live: Awaited<ReturnType<typeof getAssessmentWithVersionBySlug>> = null;
  try {
    live = await getAssessmentWithVersionBySlug(slug);
  } catch {
    live = null;
  }

  const fallback = CATALOGUE.find((a) => a.slug === slug);
  if (!live && !fallback) notFound();

  const detail = getAssessmentDetail(slug);

  const title = live?.title ?? fallback!.title;
  const description = live?.longDescription || live?.shortDescription || fallback!.shortDescription;
  const icon = live?.icon ?? fallback!.icon;
  const duration = live?.estimatedDurationMinutes ?? fallback!.estimatedDurationMinutes;
  const questionCount = live?.questionCount ?? fallback!.questionCount;
  const difficulty = live?.difficulty ?? fallback!.difficulty;
  const access = live?.access ?? fallback!.access;

  // Prefer the live version's dimensions (authoritative once seeded); fall
  // back to the generated detail so the page is complete either way.
  const dimensions =
    live && live.version.scoringDimensions.length > 0
      ? live.version.scoringDimensions.map((d) => ({
          key: d.id,
          label: d.label,
          description: d.description ?? null,
          contributesToBrainProfile: Boolean(d.contributesToBrainProfile),
        }))
      : (detail?.dimensions ?? []);

  const sections = detail?.sections ?? [];
  const bands = detail?.bands ?? [];
  const formats = (detail?.questionTypes ?? [])
    .map((t) => QUESTION_FORMAT_LABELS[t])
    .filter((v): v is string => Boolean(v));

  const comingSoon = Boolean(fallback?.comingSoon);
  const startable = Boolean(live) && !comingSoon;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <nav className="mb-8 text-sm">
        <Link href="/assessments" className="focus-ring rounded text-paper-100/50 hover:text-signal-cyan">
          ← All assessments
        </Link>
      </nav>

      <div className="flex items-start justify-between gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl2 bg-signal-violet/15 text-signal-violet">
          <AssessmentIcon icon={icon} className="h-7 w-7" />
        </span>
        {access === "premium" && (
          <span className="flex items-center gap-1.5 rounded-full border border-ink-600 px-3 py-1.5 text-xs text-paper-100/55">
            <Lock className="h-3.5 w-3.5" /> Premium
          </span>
        )}
      </div>

      <h1 className="mt-6 font-display text-4xl text-paper-100">{title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-paper-100/65">{description}</p>

      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-paper-100/50">
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" /> {duration} minutes
        </span>
        <span className="flex items-center gap-1.5">
          <ListChecks className="h-4 w-4" /> {questionCount} questions
        </span>
        <span className="flex items-center gap-1.5 capitalize">
          <Signal className="h-4 w-4" /> {difficulty}
        </span>
      </div>

      {/* The primary action sits above the fold — everything below is
          supporting detail a visitor reads only if they want it. */}
      <div id="start">
        {comingSoon ? (
          <div className="mt-10 rounded-xl2 border border-signal-cyan/25 bg-signal-cyan/5 p-5">
            <p className="flex items-center gap-2 text-sm font-medium text-signal-cyan">
              <Sparkles className="h-4 w-4" /> In development
            </p>
            <p className="mt-2 text-sm leading-relaxed text-paper-100/60">
              This assessment is on the roadmap but isn&apos;t ready yet. We publish an assessment
              only once its questions are genuinely scored — never as a placeholder.
            </p>
            <Link
              href="/assessments"
              className="focus-ring mt-4 inline-flex min-h-[44px] items-center rounded-xl2 border border-ink-600 px-5 text-sm font-medium text-paper-100 hover:border-signal-cyan/60 hover:text-signal-cyan"
            >
              Browse available assessments
            </Link>
          </div>
        ) : !live ? (
          <div className="mt-10 rounded-xl2 border border-ink-600 bg-ink-800/40 p-5">
            <p className="text-sm font-medium text-paper-100">Temporarily unavailable</p>
            <p className="mt-2 text-sm leading-relaxed text-paper-100/60">
              This assessment can&apos;t be started right now. Everything below describes exactly
              what it measures and how it&apos;s scored — please check back shortly.
            </p>
            <Link
              href="/assessments"
              className="focus-ring mt-4 inline-flex min-h-[44px] items-center rounded-xl2 border border-ink-600 px-5 text-sm font-medium text-paper-100 hover:border-signal-cyan/60 hover:text-signal-cyan"
            >
              Browse other assessments
            </Link>
          </div>
        ) : !user ? (
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href={`/login?next=/assessments/${slug}`}
              className="focus-ring flex min-h-[48px] items-center rounded-xl2 bg-signal-violet px-7 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Log in to start
            </Link>
            <p className="text-sm text-paper-100/45">
              Your answers save as you go, so you can stop and resume.
            </p>
          </div>
        ) : slug === "palmistry" ? (
          <form action={startOrResumeAttemptAction.bind(null, slug)} className="mt-10">
            <button
              type="submit"
              className="focus-ring flex min-h-[48px] items-center rounded-xl2 bg-signal-violet px-7 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Start assessment
            </button>
          </form>
        ) : (
          <AssessmentStartGate formAction={startOrResumeAttemptAction.bind(null, slug)} />
        )}
      </div>

      {slug === "palmistry" && (
        <div className="mt-8 flex gap-3 rounded-xl2 border border-ink-600 bg-ink-800/40 p-4 text-sm text-paper-100/60">
          <ShieldCheck className="h-5 w-5 shrink-0 text-signal-cyan" />
          <p>
            Palmistry is offered for entertainment and self-reflection. It is not a scientifically
            validated diagnosis, and it never contributes to your EvalOtter cognitive score.
          </p>
        </div>
      )}

      {dimensions.length > 0 && (
        <Section title="What this measures">
          <ul className="grid gap-3 sm:grid-cols-2">
            {dimensions.map((d) => (
              <li key={d.key} className="rounded-xl2 border border-ink-700 bg-ink-800/40 p-4">
                <p className="text-sm font-medium text-paper-100">{d.label}</p>
                {d.description && (
                  <p className="mt-1.5 text-sm leading-relaxed text-paper-100/55">{d.description}</p>
                )}
                {d.contributesToBrainProfile && (
                  <p className="mt-2.5 text-[11px] uppercase tracking-wider text-signal-cyan/70">
                    Feeds your Brain Profile
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {sections.length > 0 && (
        <Section title={`How it's structured — ${sections.length} ${sections.length === 1 ? "part" : "parts"}`}>
          <ol className="flex flex-col gap-3">
            {sections.map((s, i) => {
              const limit = minutes(s.timeLimitSeconds);
              return (
                <li key={s.key} className="flex gap-4 rounded-xl2 border border-ink-700 bg-ink-800/40 p-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-900 font-display text-xs text-paper-100/60">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-paper-100">{s.name}</p>
                    {s.description && (
                      <p className="mt-1.5 text-sm leading-relaxed text-paper-100/55">{s.description}</p>
                    )}
                    <p className="mt-2 flex flex-wrap gap-x-4 text-xs text-paper-100/40">
                      {s.questionCount > 0 && (
                        <span>
                          {s.questionCount} {s.questionCount === 1 ? "question" : "questions"}
                        </span>
                      )}
                      {limit && <span>Timed · {limit}</span>}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Section>
      )}

      {formats.length > 0 && (
        <Section title="Question formats">
          <div className="flex flex-wrap gap-2">
            {formats.map((f) => (
              <span key={f} className="rounded-full border border-ink-600 px-3.5 py-1.5 text-xs text-paper-100/70">
                {f}
              </span>
            ))}
          </div>
        </Section>
      )}

      {bands.length > 0 && (
        <Section title="How your score is banded">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[22rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink-700 text-left text-xs uppercase tracking-wider text-paper-100/40">
                  <th className="pb-2 pr-4 font-normal">Band</th>
                  <th className="pb-2 font-normal">Score range</th>
                </tr>
              </thead>
              <tbody>
                {bands.map((b) => (
                  <tr key={b.title} className="border-b border-ink-800/70 last:border-0">
                    <td className="py-2.5 pr-4 text-paper-100">{b.title}</td>
                    <td className="py-2.5 tabular-nums text-paper-100/55">
                      {b.minScore}–{b.maxScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {startable && (
        <div className="mt-12 border-t border-ink-700 pt-8">
          <a
            href="#start"
            className="focus-ring inline-flex min-h-[48px] items-center rounded-xl2 border border-ink-600 px-7 text-sm font-medium text-paper-100 hover:border-signal-cyan/60 hover:text-signal-cyan"
          >
            Back to start ↑
          </a>
        </div>
      )}
    </div>
  );
}
