"use client";

import { useEffect, useMemo, useState } from "react";
import type { QuestionComponentProps } from "./registry";

/**
 * Free-recall input: the user studies a word/item list for
 * `question.timeLimitSeconds`, then types back everything they remember,
 * one item at a time. The "correct" list is the question's own options
 * (each isCorrect:true, with its own scoreConfig) — scoring compares the
 * typed entries against those option labels case-insensitively.
 */
export function MemoryRecallQuestion({ question, value, onChange }: QuestionComponentProps) {
  const studyItems = useMemo(() => (question.options ?? []).filter((o) => o.isCorrect), [question.options]);
  const studySeconds = question.timeLimitSeconds ?? 20;

  const [secondsLeft, setSecondsLeft] = useState(studyItems.length > 0 ? studySeconds : 0);
  const phase: "study" | "recall" = secondsLeft > 0 ? "study" : "recall";

  useEffect(() => {
    if (phase !== "study") return;
    const timer = setTimeout(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(timer);
  }, [phase, secondsLeft]);

  const recalled = value?.type === "memory_recall" ? value.recalled : [];
  const [draft, setDraft] = useState("");

  function addItem() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange({ type: "memory_recall", recalled: [...recalled, trimmed] });
    setDraft("");
  }

  function removeItem(index: number) {
    onChange({ type: "memory_recall", recalled: recalled.filter((_, i) => i !== index) });
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
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder="Type an item you remember and press Enter"
          className="focus-ring flex-1 rounded-xl2 border border-ink-600 bg-ink-800/60 px-5 py-4 text-[15px] text-paper-100 placeholder:text-paper-100/30"
        />
        <button
          type="button"
          onClick={addItem}
          className="focus-ring rounded-xl2 border border-ink-600 bg-ink-700/60 px-5 text-sm font-medium text-paper-100 hover:border-ink-500"
        >
          Add
        </button>
      </div>
      {recalled.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {recalled.map((item, i) => (
            <li
              key={`${item}-${i}`}
              className="flex items-center gap-2 rounded-full border border-ink-600 bg-ink-800/60 px-4 py-2 text-sm text-paper-100/85"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(i)}
                aria-label={`Remove ${item}`}
                className="focus-ring text-paper-100/40 hover:text-paper-100"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
