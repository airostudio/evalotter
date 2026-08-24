import Link from "next/link";
import { Download, Trophy, TrendingDown, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/current-user";
import { RadarChartCard } from "@/components/charts/RadarChartCard";
import { ScoreRing } from "@/components/charts/ScoreRing";
import { CATALOGUE } from "@/config/catalogue";

export const metadata = { title: "My Brain Profile" };

export default async function BrainProfilePage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: profile }, { data: dims }, { data: achievements }] = await Promise.all([
    supabase.from("user_brain_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("brain_profile_dimensions")
      .select("*")
      .eq("user_id", user.id)
      .order("score", { ascending: false }),
    supabase
      .from("user_achievements")
      .select("earned_at, achievements(title, description, icon)")
      .eq("user_id", user.id)
      .order("earned_at", { ascending: false }),
  ]);

  const scoredDims = (dims ?? []).filter((d) => d.score != null);
  const radarData = scoredDims.map((d) => ({ dimension: d.label, score: Number(d.score) }));

  const total = profile?.assessments_total ?? CATALOGUE.length;
  const completed = profile?.assessments_completed ?? 0;
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <span className="text-xs uppercase tracking-widest text-signal-cyan/80">My Brain Profile</span>
      <h1 className="mt-2 font-display text-4xl text-paper-100">The complete picture of how you think</h1>

      <div className="mt-10 grid gap-6 md:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center gap-3 rounded-xl2 border border-ink-700 bg-ink-800/50 p-8 shadow-panel">
          <p className="text-xs uppercase tracking-widest text-paper-100/40">EvalOtter Score</p>
          <ScoreRing score={profile?.evalotter_score ? Number(profile.evalotter_score) : 0} size={180} />
          <p className="text-sm text-paper-100/50">
            {completed} / {total} assessments · {completionPct}% complete
          </p>
        </div>

        <div className="rounded-xl2 border border-ink-700 bg-ink-800/40 p-6">
          {radarData.length > 0 ? (
            <RadarChartCard data={radarData} color="#7c5cff" />
          ) : (
            <div className="flex h-72 items-center justify-center text-center text-paper-100/50">
              Complete assessments to see your multidimensional profile take shape.
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {profile?.strongest_dimension_key && (
          <div className="flex items-center gap-3 rounded-xl2 border border-ink-700 bg-ink-800/30 p-5">
            <TrendingUp className="h-5 w-5 text-signal-cyan" />
            <div>
              <p className="text-xs text-paper-100/40">Strongest</p>
              <p className="text-paper-100">
                {scoredDims.find((d) => d.dimension_key === profile.strongest_dimension_key)?.label}
              </p>
            </div>
          </div>
        )}
        {profile?.weakest_dimension_key && (
          <div className="flex items-center gap-3 rounded-xl2 border border-ink-700 bg-ink-800/30 p-5">
            <TrendingDown className="h-5 w-5 text-paper-100/50" />
            <div>
              <p className="text-xs text-paper-100/40">Growth opportunity</p>
              <p className="text-paper-100">
                {scoredDims.find((d) => d.dimension_key === profile.weakest_dimension_key)?.label}
              </p>
            </div>
          </div>
        )}
      </div>

      {scoredDims.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl text-paper-100">Dimension scores</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {scoredDims.map((d) => (
              <div key={d.id} className="rounded-xl2 border border-ink-700 bg-ink-800/30 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-paper-100/80">{d.label}</span>
                  <span className="font-medium text-paper-100">{Math.round(Number(d.score))}</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-signal-blue to-signal-cyan"
                    style={{ width: `${Math.min(100, Number(d.score))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {achievements && achievements.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl text-paper-100">Achievements</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {achievements.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-full border border-ink-600 bg-ink-800/40 px-4 py-2 text-sm text-paper-100/80"
              >
                <Trophy className="h-4 w-4 text-signal-cyan" />
                {(a.achievements as { title?: string } | null)?.title}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 flex flex-wrap gap-3">
        <a
          href="/api/reports/brain-profile"
          className="focus-ring flex min-h-[44px] items-center gap-2 rounded-xl2 border border-ink-600 px-5 text-sm text-paper-100 hover:border-ink-500"
        >
          <Download className="h-4 w-4" /> Download full profile report
        </a>
        <Link
          href="/assessments"
          className="focus-ring flex min-h-[44px] items-center gap-2 rounded-xl2 bg-signal-violet px-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Complete more assessments
        </Link>
      </div>
    </div>
  );
}
