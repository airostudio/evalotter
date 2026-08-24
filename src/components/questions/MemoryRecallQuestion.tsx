"use client";

import { useState } from "react";
import type { QuestionComponentProps } from "./registry";

/**
 * Free-recall input: the user types back everything they remember from a
 * prior study phase (word list, image sequence, etc), one item at a time.
 * The study phase itself is presented by the section instructions/timer;
 * this component only captures the recall.
 */
export function MemoryRecallQuestion({ value, onChange }: QuestionComponentProps) {
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
