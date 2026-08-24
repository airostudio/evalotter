"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Check, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { registerBuiltInQuestionComponents } from "@/components/questions";
import { getQuestionComponent } from "@/components/questions/registry";
import { submitPalmistryAction } from "@/actions/palmistry";
import type { AssessmentRendererProps } from "@/lib/assessment-engine/types";
import type { AnswerValue } from "@/types";

registerBuiltInQuestionComponents();

type Step = "consent" | "left-palm" | "right-palm" | "questions" | "submitting";

/**
 * Palmistry works differently from a standard questionnaire: capture both
 * palms with an on-screen guide, answer a few contextual questions, then
 * submit for (vision-model-ready) analysis. Entertainment/self-reflection
 * framing is enforced throughout, per platform policy.
 */
export function PalmistryCapture({ assessment, attempt }: AssessmentRendererProps) {
  const contextQuestions = assessment.version.questions
    .slice()
    .sort((a, b) => a.order - b.order);

  const [step, setStep] = useState<Step>("consent");
  const [consented, setConsented] = useState(false);
  const [leftPreview, setLeftPreview] = useState<string | null>(null);
  const [rightPreview, setRightPreview] = useState<string | null>(null);
  const [leftFile, setLeftFile] = useState<File | null>(null);
  const [rightFile, setRightFile] = useState<File | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const leftInput = useRef<HTMLInputElement>(null);
  const rightInput = useRef<HTMLInputElement>(null);

  function handleCapture(side: "left" | "right", file: File | undefined) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (side === "left") {
      setLeftFile(file);
      setLeftPreview(url);
    } else {
      setRightFile(file);
      setRightPreview(url);
    }
  }

  function handleSubmit() {
    if (!leftFile || !rightFile) {
      setError("Both palms are required.");
      return;
    }
    setStep("submitting");
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("attemptId", attempt.id);
        formData.set("left", leftFile);
        formData.set("right", rightFile);
        formData.set("contextAnswers", JSON.stringify(answers));
        await submitPalmistryAction(formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
        setStep("questions");
      }
    });
  }

  if (step === "consent") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-10 text-center">
        <ShieldCheck className="mb-4 h-8 w-8 text-signal-cyan" />
        <h2 className="font-display text-2xl text-paper-100">Before you begin</h2>
        <p className="mt-4 text-sm leading-relaxed text-paper-100/70">
          Palmistry on Brainyak is offered for <strong>entertainment and self-reflection</strong>{" "}
          only — it is not a scientifically validated or clinical assessment. You&apos;ll be asked
          to photograph both palms. Images are stored securely, visible only to you, and you can
          delete them at any time from your account.
        </p>
        <label className="mt-6 flex items-start gap-3 text-left text-sm text-paper-100/80">
          <input
            type="checkbox"
            checked={consented}
            onChange={(e) => setConsented(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-ink-500 bg-ink-800 accent-signal-cyan"
          />
          I understand and consent to uploading photos of my palms for this entertainment reading.
        </label>
        <button
          type="button"
          disabled={!consented}
          onClick={() => setStep("left-palm")}
          className="focus-ring mt-8 min-h-[48px] rounded-xl2 bg-signal-violet px-8 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    );
  }

  if (step === "left-palm" || step === "right-palm") {
    const side = step === "left-palm" ? "left" : "right";
    const preview = side === "left" ? leftPreview : rightPreview;
    const inputRef = side === "left" ? leftInput : rightInput;

    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-10 text-center">
        <h2 className="font-display text-2xl capitalize text-paper-100">Photograph your {side} palm</h2>
        <p className="mt-3 max-w-sm text-sm text-paper-100/60">
          Lay your hand flat, palm facing up, in good light. Fit your whole palm inside the guide.
        </p>

        <div className="relative mt-8 flex h-72 w-72 items-center justify-center rounded-full border-2 border-dashed border-signal-cyan/40 bg-ink-800/40">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt={`${side} palm`} className="h-full w-full rounded-full object-cover" />
          ) : (
            <Camera className="h-10 w-10 text-paper-100/30" />
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleCapture(side, e.target.files?.[0])}
        />

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="focus-ring min-h-[48px] rounded-xl2 border border-ink-600 px-6 text-sm font-medium text-paper-100 hover:border-ink-500"
          >
            {preview ? "Retake" : "Take photo"}
          </button>
          <button
            type="button"
            disabled={!preview}
            onClick={() => setStep(side === "left" ? "right-palm" : "questions")}
            className="focus-ring flex min-h-[48px] items-center gap-2 rounded-xl2 bg-signal-violet px-6 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Check className="h-4 w-4" /> Use this photo
          </button>
        </div>
      </div>
    );
  }

  if (step === "questions") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-10">
        <h2 className="mb-8 text-center font-display text-2xl text-paper-100">A little context</h2>

        <div className="flex flex-col gap-8">
          {contextQuestions.map((aq) => {
            const Q = getQuestionComponent(aq.question.questionType);
            if (!Q) return null;
            return (
              <div key={aq.id}>
                <p className="mb-3 text-[15px] text-paper-100">{aq.question.questionText}</p>
                <Q
                  question={aq.question}
                  value={answers[aq.question.id]}
                  onChange={(v) => setAnswers((prev) => ({ ...prev, [aq.question.id]: v }))}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          {leftPreview && rightPreview && (
            <div className="flex gap-3">
              <ThumbWithRemove src={leftPreview} onRemove={() => setLeftPreview(null)} label="Left" />
              <ThumbWithRemove src={rightPreview} onRemove={() => setRightPreview(null)} label="Right" />
            </div>
          )}
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="focus-ring min-h-[48px] rounded-xl2 bg-signal-violet px-8 text-sm font-medium text-white disabled:opacity-40"
          >
            Submit for reading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-paper-100/70">
      <Loader2 className="h-6 w-6 animate-spin text-signal-cyan" />
      Reading your palms…
    </div>
  );
}

function ThumbWithRemove({ src, onRemove, label }: { src: string; onRemove: () => void; label: string }) {
  return (
    <div className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={label} className="h-16 w-16 rounded-xl2 object-cover" />
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} palm photo`}
        className="focus-ring absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink-800 text-paper-100/70"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}
