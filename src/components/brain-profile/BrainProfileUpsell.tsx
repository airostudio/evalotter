import Link from "next/link";
import { Lock } from "lucide-react";

/**
 * Shown instead of the Brain Profile to users who have not bought the full
 * collection. It states honestly what exists and what is missing, and
 * carries no scores — the composite, the per-dimension figures and the
 * strongest/weakest labels are never fetched for a locked user.
 */
export function BrainProfileUpsell({ completed, total }: { completed: number; total: number }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <span className="text-xs uppercase tracking-widest text-signal-cyan/80">My Brain Profile</span>
      <h1 className="mt-2 font-display text-4xl text-paper-100">The complete picture of how you think</h1>

      <div className="mt-10 flex flex-col items-center gap-4 rounded-xl2 border border-dashed border-ink-600 bg-ink-800/20 px-6 py-12">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-ink-600 text-paper-100/30">
          <Lock className="h-5 w-5" />
        </span>
        <p className="text-lg text-paper-100">Included with the full collection</p>
        <p className="max-w-md text-sm leading-relaxed text-paper-100/55">
          Your Brain Profile combines every assessment you take into one composite score, a
          dimension-by-dimension radar, and your strongest and weakest capabilities. Individual
          reports are sold separately and don&apos;t include it.
        </p>
        <p className="text-sm text-paper-100/40">
          {completed === 0
            ? `You haven't completed an assessment yet — ${total} are available.`
            : `You've completed ${completed} of ${total} assessments so far.`}
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link
            href="/pricing"
            className="focus-ring flex min-h-[48px] items-center rounded-xl2 bg-signal-violet px-7 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Unlock the full collection
          </Link>
          <Link
            href="/assessments"
            className="focus-ring flex min-h-[48px] items-center rounded-xl2 border border-ink-600 px-6 text-sm font-medium text-paper-100 hover:border-signal-cyan/60 hover:text-signal-cyan"
          >
            Browse assessments
          </Link>
        </div>
      </div>
    </div>
  );
}
