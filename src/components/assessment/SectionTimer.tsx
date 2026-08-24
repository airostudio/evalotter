"use client";

import { useEffect, useRef, useState } from "react";
import { Timer } from "lucide-react";
import { clsx } from "clsx";

export function SectionTimer({ seconds, onExpire }: { seconds: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpire();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isUrgent = remaining <= 10;

  return (
    <div
      className={clsx(
        "mb-6 flex items-center gap-1.5 self-end rounded-full border px-3 py-1.5 text-sm tabular-nums",
        isUrgent ? "border-red-400/50 text-red-300" : "border-ink-600 text-paper-100/60"
      )}
      role="timer"
      aria-live="polite"
    >
      <Timer className="h-3.5 w-3.5" />
      {minutes}:{secs.toString().padStart(2, "0")}
    </div>
  );
}
