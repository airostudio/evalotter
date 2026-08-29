import type { QuestionComponentProps } from "./registry";
import { WCSTGameQuestion } from "./WCSTGameQuestion";

/**
 * Dispatches to a specific interactive module by `question.tags`, since
 * every `custom_interactive` question shares one QuestionType but each
 * needs genuinely different game logic — there's no single generic
 * "custom interactive" UI. Falls back to a safety-net message for a
 * `custom_interactive` question tagged for a module that hasn't been
 * built yet.
 */
export function CustomInteractiveQuestion(props: QuestionComponentProps) {
  if (props.question.tags?.includes("wcst")) {
    return <WCSTGameQuestion {...props} />;
  }
  return <UnregisteredCustomInteractive {...props} />;
}

function UnregisteredCustomInteractive({ question }: QuestionComponentProps) {
  return (
    <div className="rounded-xl2 border border-dashed border-ink-500 bg-ink-800/40 p-6 text-sm text-paper-100/60">
      This question ({question.id}) uses a custom interactive module that hasn&apos;t been
      registered for this build. Register a component for it via{" "}
      <code className="rounded bg-ink-700 px-1.5 py-0.5">registerQuestionComponent</code>.
    </div>
  );
}
