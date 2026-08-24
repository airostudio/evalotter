import type { QuestionComponentProps } from "./registry";

export function LongTextQuestion({ value, onChange, autoFocus }: QuestionComponentProps) {
  const current = value?.type === "long_text" ? value.value : "";

  return (
    <textarea
      autoFocus={autoFocus}
      value={current}
      onChange={(e) => onChange({ type: "long_text", value: e.target.value })}
      rows={5}
      placeholder="Share as much detail as you'd like…"
      className="focus-ring w-full resize-none rounded-xl2 border border-ink-600 bg-ink-800/60 px-5 py-4 text-[15px] leading-relaxed text-paper-100 placeholder:text-paper-100/30"
    />
  );
}

export function OpenCreativeQuestion({ value, onChange, autoFocus }: QuestionComponentProps) {
  const current = value?.type === "open_creative" ? value.value : "";

  return (
    <textarea
      autoFocus={autoFocus}
      value={current}
      onChange={(e) => onChange({ type: "open_creative", value: e.target.value })}
      rows={6}
      placeholder="There's no wrong answer — let your imagination run."
      className="focus-ring w-full resize-none rounded-xl2 border border-ink-600 bg-ink-800/60 px-5 py-4 text-[15px] leading-relaxed text-paper-100 placeholder:text-paper-100/30"
    />
  );
}
