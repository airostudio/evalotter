import { clsx } from "clsx";
import type { QuestionComponentProps } from "./registry";

const LABELS = [
  "Strongly disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly agree",
];

export function LikertScaleQuestion({ value, onChange }: QuestionComponentProps) {
  const selected = value?.type === "likert_scale" ? value.value : undefined;

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-5 gap-2">
        {LABELS.map((_, i) => {
          const level = i + 1;
          const isSelected = selected === level;
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange({ type: "likert_scale", value: level })}
              aria-label={LABELS[i]}
              className={clsx(
                "focus-ring flex h-14 flex-col items-center justify-center rounded-xl2 border transition-colors",
                isSelected
                  ? "border-signal-cyan/70 bg-signal-cyan/10"
                  : "border-ink-600 bg-ink-800/60 hover:border-ink-500"
              )}
            >
              <span
                className={clsx(
                  "h-3 w-3 rounded-full",
                  isSelected ? "bg-signal-cyan" : "bg-ink-500"
                )}
              />
            </button>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-paper-100/50">
        <span>{LABELS[0]}</span>
        <span>{LABELS[4]}</span>
      </div>
    </div>
  );
}
