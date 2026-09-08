import { Lock } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Placeholder shown in place of a report section the user has not paid for.
 *
 * This replaces the old LockedOverlay, which rendered the real content and
 * blurred it with CSS. That content was still in the HTML, so viewing source
 * or removing one class revealed the whole paid report. Nothing sensitive is
 * passed to this component — the caller does not fetch or render the values
 * at all when the report is locked.
 *
 * `detail` is for facts about the shape of what's behind the lock ("5
 * dimensions measured"), never the values themselves.
 */
export function LockedSection({
  label,
  detail,
  children,
}: {
  label: string;
  detail?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl2 border border-dashed border-ink-600 bg-ink-800/20 px-6 py-10 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-600 text-paper-100/30">
        <Lock className="h-4 w-4" />
      </span>
      <p className="text-sm font-medium text-paper-100/70">{label}</p>
      {detail && <p className="max-w-sm text-sm leading-relaxed text-paper-100/45">{detail}</p>}
      {children}
    </div>
  );
}
