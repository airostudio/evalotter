"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "evalotter-cookie-consent";
const REOPEN_EVENT = "evalotter-cookie-preferences-reopen";

type Consent = "accepted" | "rejected";

/** Called from the footer's "Manage cookie preferences" link. */
export function reopenCookiePreferences() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable — the dispatched event still reopens the banner for this visit.
  }
  window.dispatchEvent(new Event(REOPEN_EVENT));
}

function readConsent(): Consent | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    return null;
  }
}

function writeConsent(value: Consent) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Storage unavailable (private browsing, blocked) — banner will just reappear next visit.
  }
}

/**
 * Only essential (auth/session) cookies are set today — see /cookie-policy.
 * This banner exists so that if analytics or other optional cookies are
 * added later, the consent gate is already in place rather than retrofitted.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Reads localStorage (unavailable during SSR), so this can only run
    // post-mount — the standard hydration-safe way to sync client-only state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (readConsent() === null) setVisible(true);
    const reopen = () => setVisible(true);
    window.addEventListener(REOPEN_EVENT, reopen);
    return () => window.removeEventListener(REOPEN_EVENT, reopen);
  }, []);

  function choose(value: Consent) {
    writeConsent(value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-ink-700 bg-ink-900/95 px-4 py-5 backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-sm font-medium text-paper-100">Your privacy choices</h2>
          <p className="mt-1 text-xs leading-relaxed text-paper-100/60">
            We use essential technologies to keep EvalOtter secure, remember your session and
            provide features you request. With your permission, we may also use analytics
            technologies to understand how the service is used. Optional tracking remains disabled
            until you choose to enable it. See our{" "}
            <Link href="/cookie-policy" className="underline hover:text-paper-100">
              Cookie Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => choose("rejected")}
            className="focus-ring min-h-[40px] rounded-xl2 border border-ink-600 px-4 text-xs font-medium text-paper-100 hover:border-ink-500"
          >
            Reject optional cookies
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="focus-ring min-h-[40px] rounded-xl2 bg-signal-violet px-4 text-xs font-medium text-white hover:opacity-90"
          >
            Accept optional cookies
          </button>
        </div>
      </div>
    </div>
  );
}
