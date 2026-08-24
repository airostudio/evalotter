import { clsx } from "clsx";
import type { QuestionComponentProps } from "./registry";

export function MultipleSelectQuestion({ question, value, onChange }: QuestionComponentProps) {
  const selected = value?.type === "multiple_select" ? value.optionIds : [];

  function toggle(optionId: string) {
    const next = selected.includes(optionId)
      ? selected.filter((id) => id !== optionId)
      : [...selected, optionId];
    onChange({ type: "multiple_select", optionIds: next });
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
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
              "focus-ring flex min-h-[56px] items-center rounded-xl2 border px-5 py-4 text-left text-[15px] leading-snug transition-colors",
              isSelected
                ? "border-signal-cyan/70 bg-signal-cyan/10 text-paper-100"
                : "border-ink-600 bg-ink-800/60 text-paper-100/85 hover:border-ink-500 hover:bg-ink-700/60"
            )}
          >
            <span
              className={clsx(
                "mr-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                isSelected ? "border-signal-cyan bg-signal-cyan" : "border-ink-500"
              )}
            >
              {isSelected && <span className="h-2 w-2 rounded-sm bg-ink-950" />}
            </span>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
