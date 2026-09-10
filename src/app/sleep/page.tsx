import Link from "next/link";
import type { Metadata } from "next";
import { Check, Moon, ShieldCheck } from "lucide-react";
import { AssessmentIcon } from "@/components/ui/AssessmentIcon";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { hasSleepAccess, getSleepSubscription } from "@/lib/access/entitlements";
import {
  SLEEP_BRAND,
  SLEEP_COLLECTIONS,
  SLEEP_FEATURES,
  SLEEP_PRICING,
  SLEEP_RATIONALE,
} from "@/config/sleep";
import { SleepCheckout } from "@/components/sleep/SleepCheckout";

export const metadata: Metadata = {
  title: `${SLEEP_BRAND.name} — ${SLEEP_BRAND.tagline}`,
  description: SLEEP_BRAND.summary,
};

export const dynamic = "force-dynamic";

export default async function SleepPage() {
  const user = await getCurrentUser();

  let subscribed = false;
  let subscription: Awaited<ReturnType<typeof getSleepSubscription>> = null;
  if (user) {
    const supabase = await createClient();
    [subscribed, subscription] = await Promise.all([
      hasSleepAccess(supabase, user.id),
      getSleepSubscription(supabase, user.id),
    ]);
  }

  const { monthly, annual, trialDays } = SLEEP_PRICING;

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      {/* Hero */}
      <div className="max-w-2xl">
        <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-signal-cyan/80">
          <Moon className="h-3.5 w-3.5" /> {SLEEP_BRAND.name} · optional add-on
        </span>
        <h1 className="mt-3 font-display text-4xl leading-tight text-paper-100 sm:text-5xl">
          {SLEEP_BRAND.tagline}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-paper-100/65">{SLEEP_BRAND.summary}</p>
      </div>

      {subscribed ? (
        <div className="mt-10 rounded-xl2 border border-signal-cyan/30 bg-signal-cyan/5 p-6">
          <p className="flex items-center gap-2 font-medium text-signal-cyan">
            <Check className="h-4 w-4" /> Your {SLEEP_BRAND.name} subscription is active
          </p>
          {subscription?.status === "trialing" && (
            <p className="mt-2 text-sm text-paper-100/65">
              You&apos;re in your free trial
              {subscription.current_period_end
                ? ` until ${new Date(subscription.current_period_end).toLocaleDateString()}`
                : ""}
              . Cancel any time before it ends and you won&apos;t be charged.
            </p>
          )}
          <Link
            href="/dashboard"
            className="focus-ring mt-4 inline-flex min-h-[44px] items-center rounded-xl2 border border-ink-600 px-5 text-sm font-medium text-paper-100 hover:border-signal-cyan/60"
          >
            Go to your dashboard
          </Link>
        </div>
      ) : (
        <div className="mt-10">
          <SleepCheckout signedIn={Boolean(user)} />
        </div>
      )}

      {/* The library */}
      <section className="mt-20">
        <h2 className="font-display text-2xl text-paper-100">Three strands, one job</h2>
        <p className="mt-2 max-w-2xl text-paper-100/60">
          Different people need different things at midnight. All three are included.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {SLEEP_COLLECTIONS.map((c) => (
            <div key={c.key} className="flex flex-col rounded-xl2 border border-ink-700 bg-ink-800/40 p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl2 bg-signal-violet/15 text-signal-violet">
                <AssessmentIcon icon={c.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg text-paper-100">{c.name}</h3>
              <p className="text-xs uppercase tracking-wider text-paper-100/40">{c.kind}</p>
              <p className="mt-2 text-sm font-medium text-signal-cyan/80">{c.tagline}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-paper-100/60">{c.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What you get */}
      <section className="mt-20">
        <h2 className="font-display text-2xl text-paper-100">What&apos;s included</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {SLEEP_FEATURES.map((f) => (
            <div key={f.title}>
              <h3 className="flex items-center gap-2 text-sm font-medium text-paper-100">
                <Check className="h-4 w-4 shrink-0 text-signal-cyan" /> {f.title}
              </h3>
              <p className="mt-2 pl-6 text-sm leading-relaxed text-paper-100/60">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why it belongs here */}
      <section className="mt-20 rounded-xl2 border border-ink-700 bg-ink-800/40 p-8">
        <h2 className="font-display text-xl text-paper-100">{SLEEP_RATIONALE.heading}</h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-paper-100/65">{SLEEP_RATIONALE.body}</p>
        <div className="mt-6 flex gap-3 border-t border-ink-700 pt-5 text-sm text-paper-100/55">
          <ShieldCheck className="h-5 w-5 shrink-0 text-signal-cyan" />
          <p className="leading-relaxed">{SLEEP_RATIONALE.disclaimer}</p>
        </div>
      </section>

      {/* Pricing */}
      {!subscribed && (
        <section className="mt-20">
          <h2 className="font-display text-2xl text-paper-100">Pricing</h2>
          <p className="mt-2 text-paper-100/60">
            {trialDays} days free. Cancel any time during the trial and you won&apos;t be charged.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl2 border border-ink-700 bg-ink-800/40 p-6">
              <p className="text-xs uppercase tracking-widest text-paper-100/40">Monthly</p>
              <p className="mt-2 font-display text-3xl text-paper-100">
                {monthly.label}
                <span className="text-base text-paper-100/45"> / {monthly.period}</span>
              </p>
              <p className="mt-3 text-sm text-paper-100/55">Rolling. Stop whenever you like.</p>
            </div>
            <div className="rounded-xl2 border border-signal-cyan/40 bg-signal-cyan/[0.04] p-6">
              <p className="flex items-center justify-between text-xs uppercase tracking-widest text-signal-cyan/80">
                Annual
                <span className="rounded-full border border-signal-cyan/30 px-2 py-0.5 text-[11px]">
                  Save {annual.savingsPercent}%
                </span>
              </p>
              <p className="mt-2 font-display text-3xl text-paper-100">
                {annual.label}
                <span className="text-base text-paper-100/45"> / {annual.period}</span>
              </p>
              <p className="mt-3 text-sm text-paper-100/55">
                Works out at about ${(annual.amountCents / 12 / 100).toFixed(2)} a month.
              </p>
            </div>
          </div>
          <div className="mt-8">
            <SleepCheckout signedIn={Boolean(user)} />
          </div>
        </section>
      )}
    </div>
  );
}
