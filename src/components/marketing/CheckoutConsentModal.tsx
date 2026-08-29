"use client";

import { useState } from "react";

/**
 * Shown before a purchase begins. Digital reports here are delivered
 * immediately on payment, which can affect statutory cancellation/withdrawal
 * rights in some jurisdictions — see Terms of Use §16-19 and the Refund
 * Policy. This checkbox records the request for immediate performance; it
 * is not assumed on its own to waive a right that cannot be waived.
 */
export function CheckoutConsentModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 px-4">
      <div className="w-full max-w-md rounded-xl2 border border-ink-600 bg-ink-800 p-6">
        <h2 className="font-display text-lg text-paper-100">Immediate access</h2>
        <p className="mt-3 text-sm leading-relaxed text-paper-100/65">
          Your assessment/report will begin processing immediately after payment.
        </p>
        <label className="mt-4 flex items-start gap-3 text-left text-xs leading-relaxed text-paper-100/70">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink-500 bg-ink-800 accent-signal-cyan"
          />
          I request immediate supply of my purchased digital assessment and report. Where applicable
          law provides a cancellation or withdrawal period, I expressly request that performance
          begins immediately and acknowledge that beginning or completing performance may affect or
          end that right where permitted by law.
        </label>
        <p className="mt-3 text-xs text-paper-100/40">
          This acknowledgement does not affect any consumer rights that cannot legally be waived.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="focus-ring min-h-[40px] rounded-xl2 border border-ink-600 px-4 text-sm text-paper-100 hover:border-ink-500"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!acknowledged}
            onClick={onConfirm}
            className="focus-ring min-h-[40px] rounded-xl2 bg-signal-violet px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue to payment
          </button>
        </div>
      </div>
    </div>
  );
}
