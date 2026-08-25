import type { Metadata } from "next";
import Link from "next/link";
import { Check, ExternalLink, Sparkles } from "lucide-react";
import { SimplePageHeader } from "@/components/marketing/SimplePageHeader";
import { PricingBuyButton } from "@/components/marketing/PricingBuyButton";
import { listPublishedAssessments } from "@/lib/assessment-engine/queries";
import { CATALOGUE } from "@/config/catalogue";
import { PRICING, PERFECT_LOVE_SITE_URL } from "@/lib/stripe/pricing";

export const metadata: Metadata = { title: "Pricing" };
export const revalidate = 60;

interface PricingRow {
  id: string | null;
  slug: string;
  title: string;
  shortDescription: string;
}

async function getIndividualAssessments(): Promise<PricingRow[]> {
  try {
    const assessments = await listPublishedAssessments();
    if (assessments.length > 0) {
      return assessments.map((a) => ({ id: a.id, slug: a.slug, title: a.title, shortDescription: a.shortDescription }));
    }
  } catch {
    // Supabase not configured/seeded yet — fall back below.
  }
  return CATALOGUE.filter((a) => !a.comingSoon).map((a) => ({
    id: null,
    slug: a.slug,
    title: a.title,
    shortDescription: a.shortDescription,
  }));
}

export default async function PricingPage() {
  const assessments = await getIndividualAssessments();
  const singlePrice = (PRICING.singleReport.amountCents / 100).toFixed(2);
  const collectionPrice = (PRICING.fullCollection.amountCents / 100).toFixed(2);
  const bundlePrice = (PRICING.collectionPlusLove.amountCents / 100).toFixed(2);

  return (
    <div>
      <SimplePageHeader
        eyebrow="Pricing"
        title="Take every assessment free. Pay only to unlock the full result."
        lede="Every assessment is free to take, start to finish. Your score is computed the moment you finish — unlocking the full breakdown, AI interpretation, and downloadable report is what costs money."
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-display text-xl text-paper-100">Unlock one report at a time</h2>
        <p className="mt-2 text-sm text-paper-100/60">
          ${singlePrice} unlocks the full results for a single assessment, once you&apos;ve taken it.
        </p>
        <div className="mt-6 flex flex-col divide-y divide-ink-700 overflow-hidden rounded-xl2 border border-ink-700">
          {assessments.map((a) => (
            <div key={a.slug} className="flex items-center justify-between gap-4 bg-ink-800/30 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-paper-100">{a.title}</p>
                <p className="mt-0.5 truncate text-xs text-paper-100/50">{a.shortDescription}</p>
              </div>
              {a.id ? (
                <PricingBuyButton
                  type="single"
                  assessmentId={a.id}
                  className="focus-ring shrink-0 rounded-xl2 border border-ink-600 px-4 py-2 text-sm font-medium text-paper-100 hover:border-signal-cyan/50"
                >
                  ${singlePrice}
                </PricingBuyButton>
              ) : (
                <Link
                  href={`/assessments/${a.slug}`}
                  className="focus-ring shrink-0 rounded-xl2 border border-ink-600 px-4 py-2 text-sm font-medium text-paper-100 hover:border-signal-cyan/50"
                >
                  Take it free
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-16 grid max-w-4xl gap-6 px-4 pb-20 sm:px-6 md:grid-cols-2">
        <div className="flex flex-col rounded-xl2 border border-signal-cyan/60 bg-ink-800/60 p-7 shadow-panel">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-signal-cyan/10 px-3 py-1 text-xs font-medium text-signal-cyan">
            <Sparkles className="h-3 w-3" /> Best value
          </span>
          <h2 className="mt-3 font-display text-lg text-paper-100">Full collection</h2>
          <p className="mt-3 flex items-baseline gap-1">
            <span className="font-display text-3xl text-paper-100">${collectionPrice}</span>
            <span className="text-sm text-paper-100/40">one-time</span>
          </p>
          <p className="mt-3 text-sm text-paper-100/60">
            Unlock full results for every EvalOtter assessment — forever, including everything you take
            from now on.
          </p>
          <ul className="mt-5 flex flex-1 flex-col gap-2.5">
            {["Every current and future assessment", "Full dimension breakdowns & AI interpretation", "Downloadable PDF reports", "No subscription, pay once"].map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-paper-100/70">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-signal-cyan" /> {f}
              </li>
            ))}
          </ul>
          <PricingBuyButton
            type="collection"
            className="focus-ring mt-7 flex min-h-[46px] items-center justify-center rounded-xl2 bg-signal-violet text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Unlock everything — ${collectionPrice}
          </PricingBuyButton>
        </div>

        <div className="flex flex-col rounded-xl2 border border-ink-700 bg-ink-800/30 p-7">
          <h2 className="font-display text-lg text-paper-100">Full collection + Perfect Love</h2>
          <p className="mt-3 flex items-baseline gap-1">
            <span className="font-display text-3xl text-paper-100">${bundlePrice}</span>
            <span className="text-sm text-paper-100/40">one-time</span>
          </p>
          <p className="mt-3 text-sm text-paper-100/60">
            Everything in the full collection, plus access to{" "}
            <a
              href={PERFECT_LOVE_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-signal-cyan hover:underline"
            >
              Perfect Love <ExternalLink className="h-3 w-3" />
            </a>
            , our astrology platform.
          </p>
          <ul className="mt-5 flex flex-1 flex-col gap-2.5">
            {["Everything in Full collection", "Perfect Love astrology platform access", "One checkout, one price"].map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-paper-100/70">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-signal-cyan" /> {f}
              </li>
            ))}
          </ul>
          <PricingBuyButton
            type="collection_plus_love"
            className="focus-ring mt-7 flex min-h-[46px] items-center justify-center rounded-xl2 border border-ink-600 text-sm font-medium text-paper-100 transition-opacity hover:opacity-90"
          >
            Unlock everything + Perfect Love — ${bundlePrice}
          </PricingBuyButton>
          <p className="mt-3 text-xs text-paper-100/35">
            Perfect Love access is fulfilled separately from EvalOtter — you&apos;ll get instructions by email
            after checkout.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pb-20 text-center text-sm text-paper-100/40 sm:px-6">
        All payments are one-time and processed securely by Stripe. No subscriptions, no recurring
        charges, no auto-renewal.
      </div>
    </div>
  );
}
