"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CheckoutConsentModal } from "./CheckoutConsentModal";

interface PricingBuyButtonProps {
  type: "single" | "collection" | "collection_plus_love";
  assessmentId?: string;
  children: ReactNode;
  className: string;
}

export function PricingBuyButton({ type, assessmentId, children, className }: PricingBuyButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConsent, setShowConsent] = useState(false);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, assessmentId }),
      });

      if (res.status === 401) {
        router.push(`/login?next=/pricing`);
        return;
      }

      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Something went wrong starting checkout.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong starting checkout.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-1.5">
      <button type="button" onClick={() => setShowConsent(true)} disabled={loading} className={className}>
        {loading ? "…" : children}
      </button>
      {error && <p className="text-center text-xs text-red-300">{error}</p>}
      {showConsent && (
        <CheckoutConsentModal
          onCancel={() => setShowConsent(false)}
          onConfirm={() => {
            setShowConsent(false);
            startCheckout();
          }}
        />
      )}
    </div>
  );
}
