"use client";

import { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import type { QuestionComponentProps } from "./registry";

/**
 * Study-then-recognize memory exercise (ISLT shopping list, SKT object
 * recall): shows the correct items for `question.timeLimitSeconds`, then
 * hides them and presents the full shuffled option grid (targets +
 * distractors) for the user to pick out. Answer is emitted as
 * `multiple_select` — same shape the scoring engine already handles
 * correctly via each option's own scoreConfig, so no engine change is
 * needed for this question type.
 */
export function MemoryRecognitionQuestion({ question, value, onChange }: QuestionComponentProps) {
  const studyItems = useMemo(() => (question.options ?? []).filter((o) => o.isCorrect), [question.options]);
  const studySeconds = question.timeLimitSeconds ?? 20;

  const [secondsLeft, setSecondsLeft] = useState(studySeconds);
  const phase: "study" | "recognize" = secondsLeft > 0 ? "study" : "recognize";

  useEffect(() => {
    if (phase !== "study") return;
    const timer = setTimeout(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(timer);
  }, [phase, secondsLeft]);

  const selected = value?.type === "multiple_select" ? value.optionIds : [];

  function toggle(optionId: string) {
    const next = selected.includes(optionId)
      ? selected.filter((id) => id !== optionId)
      : [...selected, optionId];
    onChange({ type: "multiple_select", optionIds: next });
  }

  if (phase === "study") {
    return (
      <div className="flex flex-col items-center gap-6 rounded-xl2 border border-ink-600 bg-ink-800/40 px-6 py-10 text-center">
        <p className="text-xs uppercase tracking-widest text-paper-100/40">
          Study these — {secondsLeft}s remaining
        </p>
        <ul className="flex flex-wrap justify-center gap-3">
          {studyItems.map((item) => (
            <li
              key={item.id}
              className="rounded-full border border-signal-cyan/40 bg-signal-cyan/10 px-5 py-2.5 text-[15px] text-paper-100"
            >
              {item.label}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setSecondsLeft(0)}
          className="focus-ring text-xs text-paper-100/40 underline hover:text-paper-100/70"
        >
          Skip ahead
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-paper-100/60">Select every item you saw a moment ago.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(question.options ?? []).map((option) => {
          const isSelected = selected.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => toggle(option.id)}
              className={clsx(
                "focus-ring rounded-xl2 border px-4 py-3 text-left text-[14px] transition-colors",
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
    </div>
  );
}
