import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, RefreshCw, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/current-user";
import { ScoreRing } from "@/components/charts/ScoreRing";
import { RadarChartCard } from "@/components/charts/RadarChartCard";
import { DimensionBarChart } from "@/components/charts/DimensionBarChart";
import { ShareToggle } from "@/components/results/ShareToggle";
import { PalmistryResult } from "@/components/results/PalmistryResult";

interface PageProps {
  params: Promise<{ attemptId: string }>;
}

export default async function ResultPage({ params }: PageProps) {
  const { attemptId } = await params;
  const user = await requireUser();
  const supabase = await createClient();

  const { data: attempt } = await supabase
    .from("assessment_attempts")
    .select("*, assessments(title, slug, engine_type)")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .single();

  if (!attempt) notFound();

  if (attempt.assessments?.engine_type === "vision_analysis") {
    const { data: submission } = await supabase
      .from("palmistry_submissions")
      .select("*")
      .eq("attempt_id", attemptId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .maybeSingle();

    return <PalmistryResult submission={submission} assessmentTitle={attempt.assessments?.title ?? "Palmistry"} />;
  }

  const { data: result } = await supabase
    .from("assessment_results")
    .select("*, result_ranges:overall_range_id(*)")
    .eq("attempt_id", attemptId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!result) notFound();

  const { data: dimensionRows } = await supabase
    .from("result_dimensions")
    .select("*, result_ranges:range_id(*)")
    .eq("result_id", result.id);

  const dimensions = dimensionRows ?? [];

  const { data: interpretation } = await supabase
    .from("ai_interpretations")
    .select("*")
    .eq("result_id", result.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .maybeSingle();

  const { data: previousResults } = await supabase
    .from("assessment_results")
    .select("id, overall_score, created_at")
    .eq("assessment_id", attempt.assessment_id)
    .eq("user_id", user.id)
    .neq("id", result.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const radarData = dimensions.map((d) => ({ dimension: d.label, score: Number(d.score) }));
  const barData = dimensions.map((d) => ({ label: d.label, score: Number(d.score) }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <span className="text-xs uppercase tracking-widest text-signal-cyan/80">
        {attempt.assessments?.title}
      </span>
      <h1 className="mt-2 font-display text-3xl text-paper-100 sm:text-4xl">Your results</h1>

      <div className="mt-10 flex flex-col items-center gap-4 rounded-xl2 border border-ink-700 bg-ink-800/50 p-10 text-center shadow-panel">
        <ScoreRing score={Number(result.overall_score)} />
        {result.result_ranges?.title && (
          <span className="rounded-full bg-signal-cyan/10 px-4 py-1.5 text-sm font-medium text-signal-cyan">
            {result.result_ranges.title}
          </span>
        )}
        {result.result_ranges?.description && (
          <p className="max-w-md text-sm leading-relaxed text-paper-100/65">
            {result.result_ranges.description}
          </p>
        )}
      </div>

      {dimensions.length > 0 && (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl2 border border-ink-700 bg-ink-800/40 p-6">
            <h2 className="mb-2 text-sm font-medium text-paper-100/70">Dimension breakdown</h2>
            <RadarChartCard data={radarData} />
          </div>
          <div className="rounded-xl2 border border-ink-700 bg-ink-800/40 p-6">
            <h2 className="mb-4 text-sm font-medium text-paper-100/70">Scores</h2>
            <DimensionBarChart data={barData} />
          </div>
        </div>
      )}

      {dimensions.some((d) => d.result_ranges?.recommendations?.length) && (
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-medium text-paper-100/70">Strengths</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {dimensions
                .filter((d) => Number(d.score) >= 70)
                .map((d) => (
                  <li key={d.id} className="rounded-xl2 border border-ink-700 bg-ink-800/30 px-4 py-2.5 text-sm text-paper-100/80">
                    {d.label} — {Math.round(Number(d.score))}
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-medium text-paper-100/70">Development areas</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {dimensions
                .filter((d) => Number(d.score) < 70)
                .map((d) => (
                  <li key={d.id} className="rounded-xl2 border border-ink-700 bg-ink-800/30 px-4 py-2.5 text-sm text-paper-100/80">
                    {d.label} — {Math.round(Number(d.score))}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}

      {interpretation && (
        <div className="mt-10 rounded-xl2 border border-signal-cyan/30 bg-signal-cyan/[0.04] p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-signal-cyan" />
            <h2 className="text-sm font-medium text-paper-100/70">AI interpretation</h2>
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-paper-100/85">{interpretation.summary}</p>

          {interpretation.behavioural_interpretation && (
            <p className="mt-4 text-sm leading-relaxed text-paper-100/65">
              {interpretation.behavioural_interpretation}
            </p>
          )}

          {(interpretation.recommendations?.length ?? 0) > 0 && (
            <div className="mt-5">
              <h3 className="text-xs font-medium uppercase tracking-wider text-paper-100/40">Recommendations</h3>
              <ul className="mt-2 flex flex-col gap-1.5">
                {interpretation.recommendations!.map((r: string, i: number) => (
                  <li key={i} className="flex gap-2 text-sm text-paper-100/75">
                    <span className="text-signal-cyan/60">→</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {interpretation.suggested_next_assessment_slug && (
            <Link
              href={`/assessments/${interpretation.suggested_next_assessment_slug}`}
              className="focus-ring mt-5 inline-flex min-h-[40px] items-center gap-1.5 rounded-xl2 border border-ink-600 px-4 text-sm text-paper-100 hover:border-signal-cyan/50"
            >
              Suggested next: {interpretation.suggested_next_assessment_slug.replace(/-/g, " ")} →
            </Link>
          )}

          <p className="mt-5 text-xs text-paper-100/35">
            AI-generated interpretation of your scores — for education and self-reflection, not a
            clinical assessment. Your scores above are computed deterministically and are never
            altered by this interpretation.
          </p>
        </div>
      )}

      {previousResults && previousResults.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-medium text-paper-100/70">Previous attempts</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {previousResults.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-xl2 border border-ink-700 bg-ink-800/30 px-4 py-2.5 text-sm"
              >
                <span className="text-paper-100/60">{new Date(r.created_at).toLocaleDateString()}</span>
                <span className="font-medium text-paper-100">{Math.round(Number(r.overall_score))}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-12 flex flex-wrap items-center gap-3">
        <Link
          href={`/assessments/${attempt.assessments?.slug}`}
          className="focus-ring flex min-h-[44px] items-center gap-2 rounded-xl2 border border-ink-600 px-5 text-sm text-paper-100 hover:border-ink-500"
        >
          <RefreshCw className="h-4 w-4" /> Retake
        </Link>
        <a
          href={`/api/reports/assessment/${result.id}`}
          className="focus-ring flex min-h-[44px] items-center gap-2 rounded-xl2 border border-ink-600 px-5 text-sm text-paper-100 hover:border-ink-500"
        >
          <Download className="h-4 w-4" /> Download report
        </a>
        <ShareToggle resultId={result.id} initialShared={result.is_public_share} />
      </div>
    </div>
  );
}
