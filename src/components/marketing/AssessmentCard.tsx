import Link from "next/link";
import { Clock, ListChecks, Lock } from "lucide-react";
import { AssessmentIcon } from "@/components/ui/AssessmentIcon";
import type { CatalogueAssessment } from "@/config/catalogue";

interface AssessmentCardProps {
  assessment: CatalogueAssessment;
  status?: "not_started" | "in_progress" | "completed";
  latestScore?: number | null;
  bestScore?: number | null;
}

export function AssessmentCard({ assessment, status = "not_started", latestScore, bestScore }: AssessmentCardProps) {
  return (
    <div
      className={`group flex flex-col rounded-xl2 border border-ink-700 bg-ink-800/50 p-6 shadow-panel transition-colors hover:border-ink-500 ${assessment.comingSoon ? "opacity-70" : ""}`}
    >
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl2 bg-signal-violet/15 text-signal-violet">
          <AssessmentIcon icon={assessment.icon} className="h-5 w-5" />
        </span>
        {assessment.comingSoon ? (
          <span className="rounded-full border border-signal-cyan/30 bg-signal-cyan/10 px-2.5 py-1 text-[11px] font-medium text-signal-cyan">
            Coming soon
          </span>
        ) : (
          assessment.access === "premium" && (
            <span className="flex items-center gap-1 rounded-full border border-ink-600 px-2.5 py-1 text-[11px] text-paper-100/50">
              <Lock className="h-3 w-3" /> Premium
            </span>
          )
        )}
      </div>

      <h3 className="mt-4 font-display text-lg text-paper-100">{assessment.title}</h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-paper-100/60">
        {assessment.shortDescription}
      </p>

      <div className="mt-4 flex items-center gap-4 text-xs text-paper-100/45">
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> {assessment.estimatedDurationMinutes} min
        </span>
        <span className="flex items-center gap-1.5">
          <ListChecks className="h-3.5 w-3.5" /> {assessment.questionCount} questions
        </span>
        <span className="capitalize">{assessment.difficulty}</span>
      </div>

      {(latestScore != null || bestScore != null) && (
        <div className="mt-4 flex gap-4 rounded-xl2 bg-ink-900/60 px-4 py-2.5 text-xs text-paper-100/60">
          {latestScore != null && (
            <span>
              Latest <strong className="text-paper-100">{latestScore}</strong>
            </span>
          )}
          {bestScore != null && (
            <span>
              Best <strong className="text-paper-100">{bestScore}</strong>
            </span>
          )}
        </div>
      )}

      {assessment.comingSoon ? (
        <span className="mt-5 flex min-h-[44px] cursor-not-allowed items-center justify-center rounded-xl2 border border-ink-700 text-sm font-medium text-paper-100/35">
          Coming soon
        </span>
      ) : (
        <Link
          href={`/assessments/${assessment.slug}`}
          className="focus-ring mt-5 flex min-h-[44px] items-center justify-center rounded-xl2 border border-ink-600 text-sm font-medium text-paper-100 transition-colors group-hover:border-signal-cyan/60 group-hover:text-signal-cyan"
        >
          {status === "completed" ? "View results" : status === "in_progress" ? "Continue" : "Start assessment"}
        </Link>
      )}
    </div>
  );
}
