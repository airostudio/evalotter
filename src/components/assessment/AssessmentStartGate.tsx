"use client";

import { useState } from "react";

/**
 * Renders the disclaimer + "Start assessment" button as a unit so the
 * checkbox is required before the underlying server action can run.
 */
export function AssessmentStartGate({ formAction }: { formAction: (formData: FormData) => void }) {
  const [understood, setUnderstood] = useState(false);

  return (
    <div className="mt-8 flex flex-col gap-4">
      <div className="rounded-xl2 border border-ink-600 bg-ink-800/40 p-4">
        <h2 className="text-sm font-medium text-paper-100">Important</h2>
        <p className="mt-2 text-sm leading-relaxed text-paper-100/65">
          This assessment is provided for education, information and self-reflection. It is not a
          medical or psychological diagnosis and should not be used to determine whether you have a
          medical, psychiatric, neurological or developmental condition. Do not use EvalOtter
          results to make decisions about employment, healthcare, insurance, education, credit or
          another person&apos;s legal rights. If you are concerned about your physical or
          psychological health, consult an appropriately qualified healthcare professional.
        </p>
        <label className="mt-4 flex items-start gap-3 text-left text-sm text-paper-100/80">
          <input
            type="checkbox"
            checked={understood}
            onChange={(e) => setUnderstood(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-ink-500 bg-ink-800 accent-signal-cyan"
          />
          I understand the nature and limitations of this assessment.
        </label>
      </div>
      <form action={formAction}>
        <button
          type="submit"
          disabled={!understood}
          className="focus-ring flex min-h-[48px] items-center rounded-xl2 bg-signal-violet px-7 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Start assessment
        </button>
      </form>
    </div>
  );
}
