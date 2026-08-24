"use client";

import { useState, useTransition } from "react";
import { Share2, Check } from "lucide-react";
import { setResultShareAction } from "@/actions/results";

export function ShareToggle({ resultId, initialShared }: { resultId: string; initialShared: boolean }) {
  const [shared, setShared] = useState(initialShared);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !shared;
    setShared(next);
    startTransition(() => {
      setResultShareAction(resultId, next);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className="focus-ring flex min-h-[44px] items-center gap-2 rounded-xl2 border border-ink-600 px-5 text-sm text-paper-100 hover:border-ink-500"
    >
      {shared ? <Check className="h-4 w-4 text-signal-cyan" /> : <Share2 className="h-4 w-4" />}
      {shared ? "Shared publicly" : "Share result"}
    </button>
  );
}
