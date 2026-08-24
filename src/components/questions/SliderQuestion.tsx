import type { QuestionComponentProps } from "./registry";

export function SliderQuestion({ value, onChange }: QuestionComponentProps) {
  const current = value?.type === "slider" ? value.value : 50;

  return (
    <div className="flex flex-col gap-3">
      <input
        type="range"
        min={0}
        max={100}
        value={current}
        onChange={(e) => onChange({ type: "slider", value: Number(e.target.value) })}
        className="focus-ring h-2 w-full cursor-pointer appearance-none rounded-full bg-ink-600 accent-signal-cyan"
      />
      <div className="text-center text-2xl font-display text-paper-100">{current}</div>
    </div>
  );
}
