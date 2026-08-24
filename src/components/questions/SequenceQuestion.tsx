"use client";

import { useState } from "react";
import { clsx } from "clsx";
import type { QuestionComponentProps } from "./registry";

/** Tap options in order — used for pattern/sequence-completion style questions. */
export function SequenceQuestion({ question, value, onChange }: QuestionComponentProps) {
  const order = value?.type === "sequence" ? value.order : [];
  const [localOrder, setLocalOrder] = useState<string[]>(order);

  function toggle(optionId: string) {
    const next = localOrder.includes(optionId)
      ? localOrder.filter((id) => id !== optionId)
      : [...localOrder, optionId];
    setLocalOrder(next);
    onChange({ type: "sequence", order: next });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(question.options ?? []).map((option) => {
          const position = localOrder.indexOf(option.id);
          const isSelected = position !== -1;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggle(option.id)}
              className={clsx(
                "focus-ring relative flex h-16 items-center justify-center rounded-xl2 border text-[15px] font-medium transition-colors",
                isSelected
                  ? "border-signal-cyan/70 bg-signal-cyan/10 text-paper-100"
                  : "border-ink-600 bg-ink-800/60 text-paper-100/85 hover:border-ink-500"
              )}
            >
              {isSelected && (
                <span className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-signal-cyan text-xs font-bold text-ink-950">
                  {position + 1}
                </span>
              )}
              {option.label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-paper-100/50">Tap items in the correct order. Tap again to remove.</p>
    </div>
  );
}
