import { Lock } from "lucide-react";
import type { ReactNode } from "react";

/** Blurs and disables interaction on real content underneath, with a lock badge centered over it. Used on the results page for anything gated by the paywall. */
export function LockedOverlay({ children, label = "Unlock to view" }: { children: ReactNode; label?: string }) {
  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none select-none blur-md">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center rounded-xl2 bg-ink-900/30">
        <span className="flex items-center gap-1.5 rounded-full border border-ink-600 bg-ink-800/90 px-3 py-1.5 text-xs font-medium text-paper-100/80">
          <Lock className="h-3 w-3" /> {label}
        </span>
      </div>
    </div>
  );
}
