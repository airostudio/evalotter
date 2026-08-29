"use client";

/* eslint-disable react-hooks/static-components -- QuestionComponent is looked up
   from a stable registry (registerBuiltInQuestionComponents), never created here. */

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

import { registerBuiltInQuestionComponents } from "@/components/questions";
import { getQuestionComponent } from "@/components/questions/registry";
import { saveResponseAction, completeAttemptAction } from "@/actions/attempts";
import type { AnswerValue, AssessmentQuestion } from "@/types";
import type { AssessmentRendererProps } from "@/lib/assessment-engine/types";
import { ProgressBar } from "./ProgressBar";
import { QuestionMediaBlock } from "./QuestionMediaBlock";
import { SectionInstructions } from "./SectionInstructions";
import { SectionTimer } from "./SectionTimer";

registerBuiltInQuestionComponents();

export function AssessmentRunner({ assessment, attempt, responses }: AssessmentRendererProps) {
  const { version } = assessment;
  const settings = version.settings;

  const sections = useMemo(
    () => [...version.sections].sort((a, b) => a.order - b.order),
    [version.sections]
  );

  const questionsBySection = useMemo(() => {
    const map = new Map<string, AssessmentQuestion[]>();
    for (const section of sections) {
      const qs = version.questions
        .filter((q) => q.sectionId === section.id)
        .sort((a, b) => a.order - b.order);
      map.set(section.id, qs);
    }
    return map;
  }, [sections, version.questions]);

  const [answers, setAnswers] = useState<Record<string, AnswerValue>>(() => {
    const initial: Record<string, AnswerValue> = {};
    for (const r of responses) initial[r.questionId] = r.answer;
    return initial;
  });

  const initialSectionIndex = Math.max(
    0,
    sections.findIndex((s) => s.id === attempt.currentSectionId)
  );
  const [sectionIndex, setSectionIndex] = useState(initialSectionIndex);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showingInstructions, setShowingInstructions] = useState(
    settings.showInstructionsBetweenSections
  );
  const [isPending, startTransition] = useTransition();
  const questionStartedAt = useRef<number | null>(null);

  const currentSection = sections[sectionIndex];
  const sectionQuestions = currentSection ? questionsBySection.get(currentSection.id) ?? [] : [];
  const currentAssessmentQuestion = sectionQuestions[questionIndex];
  const question = currentAssessmentQuestion?.question;

  const totalQuestions = version.questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  useEffect(() => {
    questionStartedAt.current = performance.now();
  }, [sectionIndex, questionIndex]);

  const persist = useCallback(
    (questionId: string, sectionId: string, value: AnswerValue) => {
      const nextAnsweredCount = Object.keys({ ...answers, [questionId]: value }).length;
      const nextProgress = totalQuestions > 0 ? Math.round((nextAnsweredCount / totalQuestions) * 100) : 0;

      startTransition(() => {
        saveResponseAction({
          attemptId: attempt.id,
          questionId,
          sectionId,
          answer: value,
          responseTimeMs: Math.round(performance.now() - (questionStartedAt.current ?? performance.now())),
          progressPercent: nextProgress,
          currentSectionId: sectionId,
          currentQuestionId: questionId,
        });
      });
    },
    [answers, attempt.id, totalQuestions]
  );

  function handleAnswer(value: AnswerValue) {
    if (!question || !currentSection) return;
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    persist(question.id, currentSection.id, value);
  }

  function goNext() {
    if (questionIndex < sectionQuestions.length - 1) {
      setQuestionIndex((i) => i + 1);
      return;
    }
    if (sectionIndex < sections.length - 1) {
      setSectionIndex((i) => i + 1);
      setQuestionIndex(0);
      if (settings.showInstructionsBetweenSections) setShowingInstructions(true);
      return;
    }
    startTransition(() => {
      completeAttemptAction(attempt.id);
    });
  }

  function goBack() {
    if (!settings.allowBackNavigation) return;
    if (questionIndex > 0) {
      setQuestionIndex((i) => i - 1);
      return;
    }
    if (sectionIndex > 0) {
      const prevSection = sections[sectionIndex - 1];
      if (!prevSection) return;
      setSectionIndex((i) => i - 1);
      setQuestionIndex((questionsBySection.get(prevSection.id)?.length ?? 1) - 1);
    }
  }

  const isLastQuestion =
    sectionIndex === sections.length - 1 && questionIndex === sectionQuestions.length - 1;

  if (!currentSection || !question) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-paper-100/60">
        This assessment has no questions configured yet.
      </div>
    );
  }

  if (showingInstructions) {
    return (
      <SectionInstructions
        section={currentSection}
        onContinue={() => setShowingInstructions(false)}
      />
    );
  }

  const QuestionComponent = getQuestionComponent(question.questionType);
  const currentValue = answers[question.id];
  const canAdvance = !question.required || currentValue !== undefined;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-4 py-10">
      {settings.showProgressBar && (
        <div className="mb-8">
          <ProgressBar percent={progressPercent} />
          <div className="mt-2 flex items-center justify-between text-xs text-paper-100/50">
            <span>{currentSection.name}</span>
            <span>
              Question {questionIndex + 1} of {sectionQuestions.length}
            </span>
          </div>
        </div>
      )}

      {currentSection.timeLimitSeconds && (
        <SectionTimer
          key={currentSection.id}
          seconds={currentSection.timeLimitSeconds}
          onExpire={goNext}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="flex flex-1 flex-col gap-6"
        >
          <div>
            {question.instructions && (
              <p className="mb-2 text-xs uppercase tracking-wide text-signal-cyan/80">
                {question.instructions}
              </p>
            )}
            <h2 className="font-display text-xl leading-snug text-paper-100 sm:text-2xl">
              {question.questionText}
            </h2>
          </div>

          {question.media && question.media.length > 0 && (
            <QuestionMediaBlock media={question.media} />
          )}

          {QuestionComponent ? (
            <QuestionComponent question={question} value={currentValue} onChange={handleAnswer} autoFocus />
          ) : (
            <p className="text-paper-100/60">
              No renderer registered for question type &quot;{question.questionType}&quot;.
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={!settings.allowBackNavigation || (sectionIndex === 0 && questionIndex === 0)}
          className="focus-ring flex items-center gap-1.5 rounded-xl2 px-4 py-2.5 text-sm text-paper-100/60 transition-colors hover:text-paper-100 disabled:opacity-0"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <button
          type="button"
          onClick={goNext}
          disabled={!canAdvance || isPending}
          className="focus-ring flex min-h-[48px] min-w-[140px] items-center justify-center gap-2 rounded-xl2 bg-signal-violet px-6 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {isLastQuestion ? "Finish assessment" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
