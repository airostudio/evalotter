import Link from "next/link";
import { ArrowRight, PlayCircle, Sparkles, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/current-user";
import { ScoreRing } from "@/components/charts/ScoreRing";
import { CATALOGUE } from "@/config/catalogue";
import { PerfectLoveCodeCard } from "@/components/dashboard/PerfectLoveCodeCard";

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: profile }, { data: recentResults }, { data: inProgress }, { data: perfectLoveCode }] = await Promise.all([
    supabase.from("user_brain_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("assessment_results")
      .select("id, overall_score, created_at, assessments(title, slug)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("assessment_attempts")
      .select("id, assessment_id, assessments(title, slug), progress_percent")
      .eq("user_id", user.id)
      .eq("status", "in_progress")
      .order("last_activity_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("perfect_love_codes")
      .select("code, status")
      .eq("user_id", user.id)
      .order("issued_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const { data: dims } = await supabase
    .from("brain_profile_dimensions")
    .select("dimension_key, label, score")
    .eq("user_id", user.id)
    .not("score", "is", null)
    .order("score", { ascending: false });

  const strongest = dims?.[0];
  const completedSlugs = new Set(
    (recentResults ?? []).map((r) => (r.assessments as { slug?: string } | null)?.slug).filter(Boolean)
  );
  const recommended = CATALOGUE.find((a) => !completedSlugs.has(a.slug));

  const displayName = user.profile?.displayName ?? user.email?.split("@")[0] ?? "there";

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl text-paper-100">Welcome back, {displayName}</h1>
      <p className="mt-2 text-paper-100/60">Here&apos;s where your Brain Profile stands today.</p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="flex flex-col items-center justify-center rounded-xl2 border border-ink-700 bg-ink-800/50 p-8 text-center shadow-panel">
          <p className="mb-4 text-xs uppercase tracking-widest text-paper-100/40">EvalOtter Score</p>
          <ScoreRing score={profile?.evalotter_score ? Number(profile.evalotter_score) : 0} />
        </div>

        <div className="flex flex-col justify-center gap-4 rounded-xl2 border border-ink-700 bg-ink-800/50 p-8 shadow-panel">
          <div>
            <p className="text-xs uppercase tracking-widest text-paper-100/40">Assessments completed</p>
            <p className="mt-1 font-display text-3xl text-paper-100">
              {profile?.assessments_completed ?? 0} / {profile?.assessments_total ?? CATALOGUE.length}
            </p>
          </div>
          {strongest && (
            <div>
              <p className="text-xs uppercase tracking-widest text-paper-100/40">Strongest capability</p>
              <p className="mt-1 flex items-center gap-1.5 text-lg text-paper-100">
                <Trophy className="h-4 w-4 text-signal-cyan" /> {strongest.label} ({Math.round(Number(strongest.score))})
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center gap-4 rounded-xl2 border border-ink-700 bg-ink-800/50 p-8 shadow-panel">
          {inProgress ? (
            <>
              <p className="text-xs uppercase tracking-widest text-paper-100/40">Continue where you left off</p>
              <p className="text-lg text-paper-100">{(inProgress.assessments as { title?: string } | null)?.title}</p>
              <Link
                href={`/assessments/${(inProgress.assessments as { slug?: string } | null)?.slug}`}
                className="focus-ring flex items-center gap-1.5 text-sm font-medium text-signal-cyan hover:opacity-80"
              >
                <PlayCircle className="h-4 w-4" /> Resume
              </Link>
            </>
          ) : recommended ? (
            <>
              <p className="text-xs uppercase tracking-widest text-paper-100/40">Recommended next</p>
              <p className="text-lg text-paper-100">{recommended.title}</p>
              <Link
                href={`/assessments/${recommended.slug}`}
                className="focus-ring flex items-center gap-1.5 text-sm font-medium text-signal-cyan hover:opacity-80"
              >
                <Sparkles className="h-4 w-4" /> Start now
              </Link>
            </>
          ) : (
            <p className="text-paper-100/60">You&apos;ve completed every assessment. Nice work.</p>
          )}
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-paper-100">Recent results</h2>
            <Link href="/results" className="focus-ring flex items-center gap-1 text-sm text-signal-cyan hover:opacity-80">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {(recentResults ?? []).length === 0 && (
              <p className="rounded-xl2 border border-ink-700 bg-ink-800/30 p-6 text-sm text-paper-100/50">
                Complete your first assessment to see results here.
              </p>
            )}
            {(recentResults ?? []).map((r) => (
              <Link
                key={r.id}
                href={`/results/${r.id}`}
                className="focus-ring flex items-center justify-between rounded-xl2 border border-ink-700 bg-ink-800/30 px-5 py-3.5 text-sm transition-colors hover:border-ink-500"
              >
                <span className="text-paper-100/80">{(r.assessments as { title?: string } | null)?.title}</span>
                <span className="flex items-center gap-3 text-paper-100/40">
                  {new Date(r.created_at).toLocaleDateString()}
                  <strong className="text-paper-100">{Math.round(Number(r.overall_score))}</strong>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl text-paper-100">My Brain Profile</h2>
          <p className="mt-3 text-sm leading-relaxed text-paper-100/60">
            See the full multidimensional picture across every assessment you&apos;ve completed.
          </p>
          <Link
            href="/brain-profile"
            className="focus-ring mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl2 bg-signal-violet px-6 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Open Brain Profile <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {perfectLoveCode && (
          <PerfectLoveCodeCard code={perfectLoveCode.code} redeemed={perfectLoveCode.status === "redeemed"} />
        )}
      </div>
    </div>
  );
}
