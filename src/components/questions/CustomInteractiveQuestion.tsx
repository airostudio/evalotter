import type { QuestionComponentProps } from "./registry";

/**
 * Fallback renderer for engine-specific interactive modules (a cognitive
 * game, a custom visualization) that don't fit the standard question
 * types. Engines that need this register their own component for the
 * specific question via `question.tags` or handle it directly inside
 * their `renderer`; this is only the safety-net default.
 */
export function CustomInteractiveQuestion({ question }: QuestionComponentProps) {
  return (
    <div className="rounded-xl2 border border-dashed border-ink-500 bg-ink-800/40 p-6 text-sm text-paper-100/60">
      This question ({question.id}) uses a custom interactive module that hasn&apos;t been
      registered for this build. Register a component for it via{" "}
      <code className="rounded bg-ink-700 px-1.5 py-0.5">registerQuestionComponent</code>.
    </div>
  );
}
