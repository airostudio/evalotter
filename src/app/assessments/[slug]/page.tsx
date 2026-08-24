import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Clock, ListChecks, ShieldCheck } from "lucide-react";
import { CATALOGUE } from "@/config/catalogue";
import { AssessmentIcon } from "@/components/ui/AssessmentIcon";
import { getAssessmentWithVersionBySlug } from "@/lib/assessment-engine/queries";
import { getCurrentUser } from "@/lib/auth/current-user";
import { startOrResumeAttemptAction } from "@/actions/attempts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const fallback = CATALOGUE.find((a) => a.slug === slug);
  return { title: fallback?.title ?? "Assessment" };
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

  const title = live?.title ?? fallback!.title;
  const description = live?.longDescription || live?.shortDescription || fallback!.shortDescription;
  const icon = live?.icon ?? fallback!.icon;
  const duration = live?.estimatedDurationMinutes ?? fallback!.estimatedDurationMinutes;
  const questionCount = live?.questionCount ?? fallback!.questionCount;
  const difficulty = live?.difficulty ?? fallback!.difficulty;

  const dimensions = live?.version.scoringDimensions ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <span className="flex h-14 w-14 items-center justify-center rounded-xl2 bg-signal-violet/15 text-signal-violet">
        <AssessmentIcon icon={icon} className="h-7 w-7" />
      </span>

      <h1 className="mt-6 font-display text-4xl text-paper-100">{title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-paper-100/65">{description}</p>

      <div className="mt-6 flex flex-wrap gap-5 text-sm text-paper-100/50">
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" /> {duration} minutes
        </span>
        <span className="flex items-center gap-1.5">
          <ListChecks className="h-4 w-4" /> {questionCount} questions
        </span>
        <span className="capitalize">{difficulty}</span>
      </div>

      {dimensions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xs uppercase tracking-widest text-paper-100/40">What this measures</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {dimensions.map((d) => (
              <span key={d.id} className="rounded-full border border-ink-600 px-3.5 py-1.5 text-xs text-paper-100/70">
                {d.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {slug === "palmistry" && (
        <div className="mt-8 flex gap-3 rounded-xl2 border border-ink-600 bg-ink-800/40 p-4 text-sm text-paper-100/60">
          <ShieldCheck className="h-5 w-5 shrink-0 text-signal-cyan" />
          <p>
            Palmistry is offered for entertainment and self-reflection. It is not a scientifically
            validated diagnosis, and it never contributes to your Brainyak cognitive score.
          </p>
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        {!live ? (
          <p className="text-sm text-paper-100/40">
            This assessment isn&apos;t connected to a live database in this environment yet — see
            the README for setup and seeding instructions.
          </p>
        ) : !user ? (
          <Link
            href={`/login?next=/assessments/${slug}`}
            className="focus-ring flex min-h-[48px] items-center rounded-xl2 bg-signal-violet px-7 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Log in to start
          </Link>
        ) : (
          <form action={startOrResumeAttemptAction.bind(null, slug)}>
            <button
              type="submit"
              className="focus-ring flex min-h-[48px] items-center rounded-xl2 bg-signal-violet px-7 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Start assessment
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
