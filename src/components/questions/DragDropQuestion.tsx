"use client";

import { useState } from "react";
import { clsx } from "clsx";
import type { QuestionComponentProps } from "./registry";

/**
 * Tap-to-place variant of drag-and-drop (touch-first, no DnD library
 * dependency): tap an item, then tap the zone to place it in. Options
 * encode "item::zone" pairs in `option.value` to define valid zones;
 * zone labels come from each option's `label`.
 */
export function DragDropQuestion({ question, value, onChange }: QuestionComponentProps) {
  const placements = value?.type === "drag_drop" ? value.placements : {};
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const options = question.options ?? [];
  const items = options.map((o) => o.value.split("::")[0]).filter((v, i, arr) => arr.indexOf(v) === i);
  const zones = [...new Map(options.map((o) => [o.value.split("::")[1], o.label])).entries()];

  function place(zone: string) {
    if (!activeItem) return;
    onChange({ type: "drag_drop", placements: { ...placements, [activeItem]: zone } });
    setActiveItem(null);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {items
          .filter((item) => !placements[item])
          .map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActiveItem(item)}
              className={clsx(
                "focus-ring rounded-full border px-4 py-2 text-sm transition-colors",
                activeItem === item
                  ? "border-signal-cyan bg-signal-cyan/10 text-paper-100"
                  : "border-ink-600 bg-ink-800/60 text-paper-100/85 hover:border-ink-500"
              )}
            >
              {item}
            </button>
          ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {zones.map(([zone, label]) => (
          <button
            key={zone}
            type="button"
            disabled={!activeItem}
            onClick={() => place(zone!)}
            className="focus-ring flex min-h-[80px] flex-col items-start gap-2 rounded-xl2 border border-dashed border-ink-500 bg-ink-800/40 p-3 text-left disabled:cursor-not-allowed"
          >
            <span className="text-xs uppercase tracking-wide text-paper-100/50">{label}</span>
            <div className="flex flex-wrap gap-1">
              {Object.entries(placements)
                .filter(([, z]) => z === zone)
                .map(([item]) => (
                  <span key={item} className="rounded-full bg-signal-cyan/10 px-3 py-1 text-xs text-signal-cyan">
                    {item}
                  </span>
                ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
