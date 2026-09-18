import { clsx } from "clsx";

/**
 * The EvalOtter mascot, drawn rather than photographed.
 *
 * Geometric on purpose — circles and rounded forms, no outline weight, no
 * cartoon expression. It should read as a brand mark at 24px and as a
 * friendly illustration at 96px, and never as a children's sticker. Colour
 * comes from the palette so it sits in the page rather than on it.
 *
 * `mood` changes only the eyes, which is enough to carry a little warmth in
 * an empty state without turning the interface into a character.
 */
export function Otter({
  size = 48,
  mood = "calm",
  className,
}: {
  size?: number;
  mood?: "calm" | "sleepy" | "happy";
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
      className={clsx("shrink-0", className)}
    >
      {/* Ears: small, low and wide-set. Large high ears read as a bear;
          an otter's are little more than rounded nubs on the silhouette. */}
      <circle cx="11.5" cy="26" r="5.5" className="fill-signal-teal/25" />
      <circle cx="52.5" cy="26" r="5.5" className="fill-signal-teal/25" />
      <circle cx="11.5" cy="26" r="2.3" className="fill-signal-teal/40" />
      <circle cx="52.5" cy="26" r="2.3" className="fill-signal-teal/40" />

      {/* Head: wider than tall, which is the other half of the otter read. */}
      <ellipse cx="32" cy="34" rx="24" ry="20" className="fill-signal-teal/25" />

      {/* Muzzle: broad and flat, sitting low and wide across the face. */}
      <ellipse cx="32" cy="42.5" rx="16" ry="9.5" className="fill-ink-800" />

      {/* eyes */}
      {mood === "sleepy" ? (
        <>
          <path d="M20 31c2.2 2 5.3 2 7.5 0" className="stroke-paper-100/70" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M36.5 31c2.2 2 5.3 2 7.5 0" className="stroke-paper-100/70" strokeWidth="2" strokeLinecap="round" fill="none" />
        </>
      ) : mood === "happy" ? (
        <>
          <path d="M20 32c2.2-2.4 5.3-2.4 7.5 0" className="stroke-paper-100/75" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M36.5 32c2.2-2.4 5.3-2.4 7.5 0" className="stroke-paper-100/75" strokeWidth="2" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <circle cx="23" cy="30" r="2.9" className="fill-paper-100/75" />
          <circle cx="41" cy="30" r="2.9" className="fill-paper-100/75" />
        </>
      )}

      {/* nose + mouth */}
      <ellipse cx="32" cy="38" rx="4.2" ry="2.8" className="fill-paper-100/75" />
      <path d="M32 40.8v2.6M32 43.4c-2 1.9-4.6 1.9-6.4.4M32 43.4c2 1.9 4.6 1.9 6.4.4"
            className="stroke-paper-100/45" strokeWidth="1.6" strokeLinecap="round" fill="none" />

      {/* whiskers */}
      <path d="M15 41.5H8.5M15.5 45.5l-6 2M49 41.5h6.5M48.5 45.5l6 2"
            className="stroke-paper-100/22" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
