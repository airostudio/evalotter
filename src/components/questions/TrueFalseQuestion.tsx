import { clsx } from "clsx";
import type { QuestionComponentProps } from "./registry";

export function TrueFalseQuestion({ value, onChange }: QuestionComponentProps) {
  const selected = value?.type === "true_false" ? value.value : undefined;

  return (
    <div className="flex gap-3">
      {[
        { label: "True", val: true },
        { label: "False", val: false },
      ].map((opt) => (
        <button
          key={opt.label}
          type="button"
          onClick={() => onChange({ type: "true_false", value: opt.val })}
          className={clsx(
            "focus-ring min-h-[56px] flex-1 rounded-xl2 border px-6 text-[15px] font-medium transition-colors",
            selected === opt.val
              ? "border-signal-cyan/70 bg-signal-cyan/10 text-paper-100"
              : "border-ink-600 bg-ink-800/60 text-paper-100/85 hover:border-ink-500"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
