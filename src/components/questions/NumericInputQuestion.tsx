import type { QuestionComponentProps } from "./registry";

export function NumericInputQuestion({ value, onChange, autoFocus }: QuestionComponentProps) {
  const current = value?.type === "numeric_input" ? value.value : "";

  return (
    <input
      type="number"
      inputMode="numeric"
      autoFocus={autoFocus}
      value={current}
      onChange={(e) => onChange({ type: "numeric_input", value: Number(e.target.value) })}
      placeholder="Enter a number"
      className="focus-ring w-full max-w-xs rounded-xl2 border border-ink-600 bg-ink-800/60 px-5 py-4 text-lg text-paper-100 placeholder:text-paper-100/30"
    />
  );
}
