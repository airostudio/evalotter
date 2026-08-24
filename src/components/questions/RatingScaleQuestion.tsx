import { clsx } from "clsx";
import type { QuestionComponentProps } from "./registry";

export function RatingScaleQuestion({ value, onChange }: QuestionComponentProps) {
  const selected = value?.type === "rating_scale" ? value.value : undefined;

  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange({ type: "rating_scale", value: n })}
          className={clsx(
            "focus-ring flex h-11 w-11 items-center justify-center rounded-full border text-sm font-medium transition-colors",
            selected === n
              ? "border-signal-cyan/70 bg-signal-cyan/10 text-paper-100"
              : "border-ink-600 bg-ink-800/60 text-paper-100/70 hover:border-ink-500"
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
