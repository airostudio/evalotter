"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Sparkles, X, Check } from "lucide-react";
import { CheckoutConsentModal } from "@/components/marketing/CheckoutConsentModal";

interface ResultsPaywallProps {
  attemptId: string;
  assessmentTitle: string;
  /** Whether a checkout attempt just failed to confirm on redirect, so we can surface it. */
  confirmFailed?: boolean;
}

/**
 * Auto-opens on mount over the blurred results underneath. Dismissible —
 * closing it just leaves the teaser view in place, with the "Unlock full
 * results" button in the page below able to reopen it (see `ResultsUnlockButton`).
 */
export function ResultsPaywall({ attemptId, assessmentTitle, confirmFailed }: ResultsPaywallProps) {
  const [open, setOpen] = useState(true);
  const [loadingType, setLoadingType] = useState<null | "single" | "collection" | "collection_plus_love">(null);
  const [pendingType, setPendingType] = useState<null | "single" | "collection" | "collection_plus_love">(null);
  const [error, setError] = useState<string | null>(
    confirmFailed ? "We couldn't confirm that payment automatically — if you were charged, it'll unlock within a minute." : null
  );

  async function checkout(type: "single" | "collection" | "collection_plus_love") {
    setLoadingType(type);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, attemptId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Something went wrong starting checkout.");
        setLoadingType(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong starting checkout.");
      setLoadingType(null);
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="focus-ring mt-6 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl2 border border-signal-cyan/40 bg-signal-cyan/[0.06] px-5 text-sm font-medium text-signal-cyan hover:bg-signal-cyan/[0.1]"
        >
          <Lock className="h-4 w-4" /> Unlock full results
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/80 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-lg rounded-xl2 border border-ink-700 bg-ink-800 p-7 shadow-panel"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="focus-ring absolute right-4 top-4 rounded-full p-1.5 text-paper-100/40 hover:text-paper-100"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-signal-cyan" />
                <span className="text-xs uppercase tracking-widest text-signal-cyan/80">Results ready</span>
              </div>
              <h2 className="mt-2 font-display text-xl text-paper-100">
                Your {assessmentTitle} results are in
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-paper-100/60">
                Unlock your full dimension breakdown, AI interpretation, and downloadable report.
              </p>

              {error && (
                <p className="mt-4 rounded-xl2 border border-red-500/30 bg-red-500/[0.06] px-3 py-2 text-xs text-red-300">
                  {error}
                </p>
              )}

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setPendingType("single")}
                  disabled={loadingType !== null}
                  className="focus-ring flex min-h-[52px] items-center justify-between rounded-xl2 border border-ink-600 px-5 text-left hover:border-ink-500 disabled:opacity-50"
                >
                  <span>
                    <span className="block text-sm font-medium text-paper-100">This report</span>
                    <span className="block text-xs text-paper-100/50">Just {assessmentTitle}</span>
                  </span>
                  <span className="font-display text-lg text-paper-100">
                    {loadingType === "single" ? "…" : "$1.99"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPendingType("collection")}
                  disabled={loadingType !== null}
                  className="focus-ring relative flex min-h-[64px] flex-col justify-center rounded-xl2 border border-signal-cyan/60 bg-signal-cyan/[0.06] px-5 text-left hover:bg-signal-cyan/[0.1] disabled:opacity-50"
                >
                  <span className="absolute -top-2.5 left-4 rounded-full bg-signal-cyan px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-900">
                    Best value
                  </span>
                  <span className="flex items-center justify-between">
                    <span>
                      <span className="block text-sm font-medium text-paper-100">Full collection</span>
                      <span className="block text-xs text-paper-100/50">Every assessment, unlocked forever</span>
                    </span>
                    <span className="font-display text-lg text-signal-cyan">
                      {loadingType === "collection" ? "…" : "$18.99"}
                    </span>
                  </span>
                </button>
              </div>

              <p className="mt-5 text-center text-xs text-paper-100/35">
                One-time payment, secured by Stripe. No subscription, no recurring charge.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {pendingType && (
        <CheckoutConsentModal
          onCancel={() => setPendingType(null)}
          onConfirm={() => {
            const type = pendingType;
            setPendingType(null);
            checkout(type);
          }}
        />
      )}
    </>
  );
}
