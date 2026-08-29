"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import type { QuestionMedia } from "@/types";

/**
 * Renders a question's stimulus media — the part of the schema
 * (`Question.media`, typed `"image" | "svg" | "audio"` since the original
 * design) that was mapped through from the DB but never actually rendered
 * anywhere in the runner. `image`/`svg` entries are real `<img>` tags (SVG
 * data URIs render natively, no asset pipeline needed). `audio` entries
 * with a `speech:<text>` URL use the browser's built-in Web Speech API to
 * actually synthesize and play that text aloud — a real audio stimulus,
 * not a text substitute — since this platform has no server-side
 * text-to-speech or audio asset storage. A real `audio` URL (an actual
 * file) plays via a native `<audio>` element instead.
 */
export function QuestionMediaBlock({ media }: { media: QuestionMedia[] | null | undefined }) {
  if (!media || media.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      {media.map((item, i) => {
        if (item.type === "image" || item.type === "svg") {
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={item.url}
              alt={item.alt ?? ""}
              className="max-h-72 w-auto max-w-full rounded-xl2 border border-ink-700 bg-ink-800/40 p-3"
            />
          );
        }
        if (item.type === "audio") {
          return <AudioStimulus key={i} url={item.url} alt={item.alt} />;
        }
        return null;
      })}
    </div>
  );
}

function AudioStimulus({ url, alt }: { url: string; alt?: string }) {
  const isSpeech = url.startsWith("speech:");
  const [playing, setPlaying] = useState(false);
  const hasAutoPlayed = useRef(false);

  const speak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const text = url.slice("speech:".length);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onstart = () => setPlaying(true);
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isSpeech && !hasAutoPlayed.current) {
      hasAutoPlayed.current = true;
      // Autoplay on mount so the question behaves like a real listening
      // task (heard once, then answered) rather than requiring a click
      // just to hear the stimulus at all — the replay button below still
      // allows a second listen.
      speak();
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  if (isSpeech) {
    return (
      <button
        type="button"
        onClick={speak}
        className="focus-ring flex min-h-[52px] items-center gap-2 rounded-xl2 border border-signal-cyan/40 bg-signal-cyan/[0.06] px-6 text-sm font-medium text-signal-cyan hover:bg-signal-cyan/[0.1]"
      >
        <Volume2 className={playing ? "h-4 w-4 animate-pulse" : "h-4 w-4"} />
        {playing ? "Playing…" : "Play again"}
      </button>
    );
  }

  return (
    <audio controls src={url} className="w-full max-w-sm" aria-label={alt}>
      Your browser doesn&apos;t support audio playback.
    </audio>
  );
}
