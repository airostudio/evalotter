import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/current-user";
import { hasFullCollectionAccess, hasReportAccess } from "@/lib/access/entitlements";

export const metadata: Metadata = { title: "My Results" };
export const dynamic = "force-dynamic";

/**
 * The dashboard's "View all" has always pointed here, but the route did not
 * exist — every click 404'd (visible in production logs as GET /results 404).
 *
 * Scores follow the same entitlement rule as the dashboard and the results
 * page: a per-assessment score is shown only where that report is unlocked.
 */
export default async function ResultsIndexPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data } = await supabase
    .from("assessment_results")
    .select("id, attempt_id, assessment_id, overall_score, created_at, assessments(title, slug)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const results = data ?? [];
  const fullAccess = await hasFullCollectionAccess(supabase, user.id);
  const unlocked = new Map<string, boolean>(
    await Promise.all(
      results.map(
        async (r) =>
          [r.id, fullAccess || (await hasReportAccess(supabase, user.id, r.assessment_id))] as const
      )
    )
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Link
        href="/dashboard"
        className="focus-ring flex w-fit items-center gap-1.5 rounded text-sm text-paper-100/50 hover:text-signal-cyan"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
      </Link>

      <h1 className="mt-4 font-display text-3xl text-paper-100">My results</h1>
      <p className="mt-2 text-paper-100/60">
        {results.length === 0
          ? "You haven't completed an assessment yet."
          : `${results.length} completed ${results.length === 1 ? "assessment" : "assessments"}.`}
      </p>

      {results.length === 0 ? (
        <Link
          href="/assessments"
          className="focus-ring mt-8 inline-flex min-h-[48px] items-center rounded-xl2 bg-signal-violet px-7 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Browse assessments
        </Link>
      ) : (
        <div className="mt-8 flex flex-col gap-2">
          {results.map((r) => (
            <Link
              key={r.id}
              href={`/results/${r.attempt_id}`}
              className="focus-ring flex items-center justify-between rounded-xl2 border border-ink-700 bg-ink-800/30 px-5 py-4 text-sm transition-colors hover:border-ink-500"
            >
              <span className="text-paper-100/85">{(r.assessments as { title?: string } | null)?.title}</span>
              <span className="flex items-center gap-4 text-paper-100/40">
                <span className="whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</span>
                {unlocked.get(r.id) ? (
                  <strong className="font-display text-base text-paper-100">
                    {Math.round(Number(r.overall_score))}
                  </strong>
                ) : (
                  <span className="flex items-center gap-1 rounded-full border border-ink-600 px-2.5 py-1 text-[11px] text-paper-100/50">
                    <Lock className="h-3 w-3" /> Unlock
                  </span>
                )}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
