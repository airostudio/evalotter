"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { PERFECT_LOVE_SITE_URL } from "@/lib/stripe/pricing";

export function PerfectLoveCodeCard({ code, redeemed }: { code: string; redeemed: boolean }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-xl2 border border-ink-700 bg-ink-800/50 p-6 shadow-panel">
      <p className="text-xs uppercase tracking-widest text-paper-100/40">Perfect Love access code</p>
      <div className="mt-3 flex items-center gap-2">
        <code className="flex-1 rounded-xl2 border border-ink-600 bg-ink-900/60 px-4 py-2.5 text-center font-mono text-sm tracking-wider text-paper-100">
          {code}
        </code>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-xl2 border border-ink-600 text-paper-100/70 hover:border-ink-500"
        >
          {copied ? <Check className="h-4 w-4 text-signal-cyan" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      {redeemed ? (
        <p className="mt-3 text-xs text-paper-100/40">Already redeemed on Perfect Love.</p>
      ) : (
        <p className="mt-3 text-xs text-paper-100/40">
          One-time use — enter this on{" "}
          <a
            href={PERFECT_LOVE_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-signal-cyan hover:underline"
          >
            perfectlove.site <ExternalLink className="h-3 w-3" />
          </a>{" "}
          to unlock your full package.
        </p>
      )}
    </div>
  );
}
