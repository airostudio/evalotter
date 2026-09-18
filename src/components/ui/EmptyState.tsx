import type { ReactNode } from "react";
import { Otter } from "@/components/brand/Otter";

/**
 * The shared "nothing here yet" state.
 *
 * Empty screens are where an interface either reassures someone or makes
 * them feel they have done something wrong. A bordered box reading "No
 * data" does the latter, so this says what is missing in plain words, gives
 * the next action, and lets the otter carry the warmth instead of the copy
 * having to be jolly about it.
 */
export function EmptyState({
  title,
  body,
  action,
  mood = "calm",
}: {
  title: string;
  body?: string;
  action?: ReactNode;
  mood?: "calm" | "sleepy" | "happy";
}) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
      <Otter size={72} mood={mood} />
      <div>
        <p className="font-display text-lg text-paper-100">{title}</p>
        {body && <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-paper-100/55">{body}</p>}
      </div>
      {action}
    </div>
  );
}
