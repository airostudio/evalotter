import { Clock, ListChecks } from "lucide-react";
import type { AssessmentSection } from "@/types";

export function SectionInstructions({
  section,
  onContinue,
}: {
  section: AssessmentSection;
  onContinue: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-10 text-center">
      <span className="mb-4 rounded-full border border-ink-600 px-3 py-1 text-xs uppercase tracking-widest text-paper-100/50">
        Next section
      </span>
      <h2 className="font-display text-3xl text-paper-100">{section.name}</h2>
      {section.description && (
        <p className="mt-3 text-paper-100/70">{section.description}</p>
      )}
      {section.instructions && (
        <p className="mt-6 max-w-md text-sm leading-relaxed text-paper-100/60">
          {section.instructions}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-paper-100/50">
        {section.timeLimitSeconds && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {Math.round(section.timeLimitSeconds / 60)} min
          </span>
        )}
        {section.questionCount && (
          <span className="flex items-center gap-1.5">
            <ListChecks className="h-4 w-4" /> {section.questionCount} questions
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="focus-ring mt-10 min-h-[48px] rounded-xl2 bg-signal-violet px-8 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Begin
      </button>
    </div>
  );
}
