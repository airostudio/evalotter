import { clsx } from "clsx";
import type { AnswerValue } from "@/types";
import type { QuestionComponentProps } from "./registry";

/** Also used for pattern_question and visual_rotation — same option-grid interaction, different content. */
export function ImageChoiceQuestion({ question, value, onChange }: QuestionComponentProps) {
  const selected =
    value?.type === "image_choice" || value?.type === "pattern_question" || value?.type === "visual_rotation"
      ? value.optionId
      : undefined;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {(question.options ?? []).map((option) => {
        const isSelected = selected === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() =>
              onChange({
                type: question.questionType,
                optionId: option.id,
              } as AnswerValue)
            }
            className={clsx(
              "focus-ring flex aspect-square flex-col items-center justify-center gap-2 rounded-xl2 border p-3 transition-colors",
              isSelected
                ? "border-signal-cyan/70 bg-signal-cyan/10"
                : "border-ink-600 bg-ink-800/60 hover:border-ink-500"
            )}
          >
            {option.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={option.imageUrl} alt={option.label} className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-2xl">{option.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
