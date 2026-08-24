import type { ComponentType } from "react";
import type { AnswerValue, Question, QuestionType } from "@/types";

export interface QuestionComponentProps {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  autoFocus?: boolean;
}

const registry = new Map<QuestionType, ComponentType<QuestionComponentProps>>();

/** Registers a renderer for a question type so new types can be added without touching the runner. */
export function registerQuestionComponent(
  type: QuestionType,
  component: ComponentType<QuestionComponentProps>
) {
  registry.set(type, component);
}

export function getQuestionComponent(type: QuestionType): ComponentType<QuestionComponentProps> | undefined {
  return registry.get(type);
}
