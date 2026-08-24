import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { SimplePageHeader } from "@/components/marketing/SimplePageHeader";

export const metadata: Metadata = { title: "Pricing" };

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Everything you need to start building your Brain Profile.",
    features: ["All ten launch assessments", "Full results with charts", "Brain Profile dashboard", "PDF report downloads"],
    cta: "Get started",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "Coming soon",
    period: "",
    description: "Deeper AI interpretation and priority access to new assessments.",
    features: ["Everything in Free", "AI-generated interpretations", "Early access to new assessments", "Extended history & comparisons"],
    cta: "Notify me",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "Full Brainyak Profile",
    price: "Coming soon",
    period: "one-off",
    description: "Every assessment, unlocked in a single purchase.",
    features: ["All current and future assessments", "Complete Brain Profile report", "No subscription required"],
    cta: "Notify me",
    href: "/signup",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div>
      <SimplePageHeader
        eyebrow="Pricing"
        title="Start free. Upgrade when you're ready."
        lede="The core assessment experience is free today. Premium tiers, one-off unlocks, and report purchases are on the way — the platform is already built to support them."
      />

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`flex flex-col rounded-xl2 border p-7 ${
              plan.highlighted ? "border-signal-cyan/60 bg-ink-800/60 shadow-panel" : "border-ink-700 bg-ink-800/30"
            }`}
          >
            <h2 className="font-display text-lg text-paper-100">{plan.name}</h2>
            <p className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-3xl text-paper-100">{plan.price}</span>
              {plan.period && <span className="text-sm text-paper-100/40">/ {plan.period}</span>}
            </p>
            <p className="mt-3 text-sm text-paper-100/60">{plan.description}</p>
            <ul className="mt-5 flex flex-1 flex-col gap-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-paper-100/70">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-signal-cyan" /> {f}
                </li>
              ))}
            </ul>
            <Link
              href={plan.href}
              className={`focus-ring mt-7 flex min-h-[46px] items-center justify-center rounded-xl2 text-sm font-medium transition-opacity hover:opacity-90 ${
                plan.highlighted ? "bg-signal-violet text-white" : "border border-ink-600 text-paper-100"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-2xl px-4 pb-20 text-center text-sm text-paper-100/40 sm:px-6">
        Monthly and annual memberships, and single-report purchases, will appear here once billing
        is enabled — the underlying subscription and report-purchase data model already supports
        them.
      </div>
    </div>
  );
}
