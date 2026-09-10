"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { SLEEP_BRAND, SLEEP_PRICING } from "@/config/sleep";

/**
 * Starts a DriftOff subscription. Signed-out visitors are sent to sign up
 * first rather than into a checkout that cannot attach to an account —
 * a subscription needs a user to belong to.
 */
export function SleepCheckout({ signedIn }: { signedIn: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { monthly, annual, trialDays } = SLEEP_PRICING;

  if (!signedIn) {
    return (
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/signup?next=/sleep"
          className="focus-ring flex min-h-[48px] items-center rounded-xl2 bg-signal-violet px-7 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Start {trialDays} days free
        </Link>
        <p className="text-sm text-paper-100/45">
          Already have an account?{" "}
          <Link href="/login?next=/sleep" className="focus-ring rounded text-signal-cyan hover:underline">
            Log in
          </Link>
        </p>
      </div>
    );
  }

  const start = (interval: "monthly" | "annual") =>
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch("/api/stripe/sleep-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interval }),
        });
        const body = await res.json();
        if (!res.ok || !body.url) throw new Error(body.error ?? "Could not start checkout");
        window.location.href = body.url;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not start checkout");
      }
    });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => start("annual")}
          className="focus-ring flex min-h-[48px] items-center rounded-xl2 bg-signal-violet px-7 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Opening checkout…" : `Start ${trialDays} days free — then ${annual.label}/${annual.period}`}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => start("monthly")}
          className="focus-ring flex min-h-[48px] items-center rounded-xl2 border border-ink-600 px-6 text-sm font-medium text-paper-100 transition-colors hover:border-signal-cyan/60 disabled:opacity-50"
        >
          {monthly.label}/{monthly.period} instead
        </button>
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <p className="text-xs text-paper-100/40">
        {SLEEP_BRAND.name} is billed separately from assessment reports. Cancel any time.
      </p>
    </div>
  );
}
