"use client";

import { useState } from "react";
import { clsx } from "clsx";
import type { QuestionComponentProps } from "./registry";

/**
 * Options carry paired left/right values encoded as "left::right" in
 * `option.value`. The user taps a left item, then a right item, to pair them.
 */
export function MatchingQuestion({ question, value, onChange }: QuestionComponentProps) {
  const pairs = value?.type === "matching" ? value.pairs : {};
  const [activeLeft, setActiveLeft] = useState<string | null>(null);

  const options = question.options ?? [];
  const lefts = options.map((o) => o.value.split("::")[0]).filter((v, i, arr) => arr.indexOf(v) === i);
  const rights = options.map((o) => o.value.split("::")[1]).filter((v, i, arr) => arr.indexOf(v) === i);

  function selectRight(right: string) {
    if (!activeLeft) return;
    onChange({ type: "matching", pairs: { ...pairs, [activeLeft]: right } });
    setActiveLeft(null);
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-2">
        {lefts.map((left) => {
          const isMatched = Boolean(pairs[left]);
          const isActive = activeLeft === left;
          return (
            <button
              key={left}
              type="button"
              onClick={() => setActiveLeft(left)}
              className={clsx(
                "focus-ring rounded-xl2 border px-4 py-3 text-left text-sm transition-colors",
                isActive
                  ? "border-signal-cyan bg-signal-cyan/10 text-paper-100"
                  : isMatched
                    ? "border-ink-500 bg-ink-700/60 text-paper-100/70"
                    : "border-ink-600 bg-ink-800/60 text-paper-100/85 hover:border-ink-500"
              )}
            >
              {left}
              {isMatched && <span className="ml-2 text-xs text-signal-cyan">→ {pairs[left]}</span>}
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2">
        {rights.map((right) => (
          <button
            key={right}
            type="button"
            disabled={!activeLeft}
            onClick={() => selectRight(right)}
            className="focus-ring rounded-xl2 border border-ink-600 bg-ink-800/60 px-4 py-3 text-left text-sm text-paper-100/85 transition-colors hover:border-ink-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {right}
          </button>
        ))}
      </div>
    </div>
  );
}
