import Link from "next/link";
import { Lock } from "lucide-react";

/**
 * Stands in for a cross-assessment figure the user has not bought yet.
 *
 * Deliberately renders no score at all rather than a blurred real one: the
 * the old results-page overlay blurred genuine content that was still present
 * in the HTML, which is a presentation trick, not an entitlement check. The
 * composite score never reaches the page unless it has been paid for.
 */
export function LockedStat({ label, cta }: { label: string; cta: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-ink-600 text-paper-100/30">
        <Lock className="h-5 w-5" />
      </span>
      <p className="max-w-[15rem] text-sm leading-relaxed text-paper-100/50">{label}</p>
      <Link
        href="/pricing"
        className="focus-ring rounded text-sm font-medium text-signal-cyan hover:opacity-80"
      >
        {cta}
      </Link>
    </div>
  );
}
