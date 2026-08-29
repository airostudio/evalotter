"use client";

import { useState, useTransition } from "react";
import { Share2, Check } from "lucide-react";
import { setResultShareAction } from "@/actions/results";

export function ShareToggle({ resultId, initialShared }: { resultId: string; initialShared: boolean }) {
  const [shared, setShared] = useState(initialShared);
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function setShare(next: boolean) {
    setShared(next);
    startTransition(() => {
      setResultShareAction(resultId, next);
    });
  }

  function toggle() {
    if (shared) {
      setShare(false);
      return;
    }
    setConfirming(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        className="focus-ring flex min-h-[44px] items-center gap-2 rounded-xl2 border border-ink-600 px-5 text-sm text-paper-100 hover:border-ink-500"
      >
        {shared ? <Check className="h-4 w-4 text-signal-cyan" /> : <Share2 className="h-4 w-4" />}
        {shared ? "Shared publicly" : "Share result"}
      </button>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 px-4">
          <div className="w-full max-w-md rounded-xl2 border border-ink-600 bg-ink-800 p-6">
            <h2 className="font-display text-lg text-paper-100">Make this result public?</h2>
            <p className="mt-3 text-sm leading-relaxed text-paper-100/65">
              Your results are private unless you choose to share them. If you continue, anyone who
              receives your public link may be able to view the information you choose to publish.
              You can disable sharing later, although third parties or search engines may retain
              copies of information that was public.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="focus-ring min-h-[40px] rounded-xl2 border border-ink-600 px-4 text-sm text-paper-100 hover:border-ink-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirming(false);
                  setShare(true);
                }}
                className="focus-ring min-h-[40px] rounded-xl2 bg-signal-violet px-4 text-sm font-medium text-white hover:opacity-90"
              >
                Share result
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
