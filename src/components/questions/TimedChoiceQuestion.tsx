"use client";

import { useState } from "react";
import { clsx } from "clsx";
import type { QuestionComponentProps } from "./registry";

/** Multiple choice where response latency itself is scored (speed + accuracy). */
export function TimedChoiceQuestion({ question, value, onChange }: QuestionComponentProps) {
  const [startedAt] = useState(() => performance.now());
  const selected = value?.type === "timed_choice" ? value.optionId : undefined;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {(question.options ?? []).map((option) => {
        const isSelected = selected === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() =>
              onChange({
                type: "timed_choice",
                optionId: option.id,
                responseTimeMs: Math.round(performance.now() - startedAt),
              })
            }
            className={clsx(
              "focus-ring flex min-h-[56px] items-center rounded-xl2 border px-5 py-4 text-left text-[15px] transition-colors",
              isSelected
                ? "border-signal-cyan/70 bg-signal-cyan/10 text-paper-100"
                : "border-ink-600 bg-ink-800/60 text-paper-100/85 hover:border-ink-500"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
