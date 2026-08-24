import type { QuestionComponentProps } from "./registry";

export function TextInputQuestion({ value, onChange, autoFocus }: QuestionComponentProps) {
  const current = value?.type === "text_input" ? value.value : "";

  return (
    <input
      type="text"
      autoFocus={autoFocus}
      value={current}
      onChange={(e) => onChange({ type: "text_input", value: e.target.value })}
      placeholder="Type your answer"
      className="focus-ring w-full rounded-xl2 border border-ink-600 bg-ink-800/60 px-5 py-4 text-[15px] text-paper-100 placeholder:text-paper-100/30"
    />
  );
}
