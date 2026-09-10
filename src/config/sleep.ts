/**
 * Driftwater — EvalOtter's optional sleep-audio add-on.
 *
 * Driftwater, with three strands: Stillwater, Night Ferry and Slow Tide.
 * All five names are ours — none is taken from any existing sleep product,
 * and no registered mark appears anywhere in this feature.
 *
 * Every user-visible string lives in this file, so any of them can be
 * renamed in one edit. CLEAR THEM WITH A TRADEMARK SEARCH BEFORE LAUNCH:
 * I have checked that they are not the referenced company's marks, which
 * is not the same as checking that nobody else holds them.
 *
 * All copy here is original. The brief referenced Slumber Studios (a real
 * company — Slumber Group, LLC), so their names, registered marks and
 * download figures are deliberately absent: nothing here claims their
 * audience, their ratings or their catalogue.
 *
 * There are NO usage statistics in this file on purpose. The product has no
 * listeners yet, so it has no numbers, and inventing some would be the one
 * thing that could genuinely damage the brand it is meant to build.
 */

export const SLEEP_BRAND = {
  name: "Driftwater",
  parent: "EvalOtter",
  tagline: "Sleep sounds, stories and music for better nights.",
  /** One sentence, used in metadata and cards. */
  summary:
    "A calm audio library built to quiet a busy mind — soundscapes, sleep stories and slow music, designed to be listened to with your eyes closed.",
} as const;

export const SLEEP_PRICING = {
  trialDays: 7,
  monthly: {
    plan: "sleep_monthly" as const,
    amountCents: 1649,
    currency: "usd",
    label: "$16.49",
    period: "month",
  },
  annual: {
    plan: "sleep_annual" as const,
    amountCents: 17900,
    currency: "usd",
    label: "$179.00",
    period: "year",
    /** Derived, not asserted — recomputed if either price changes. */
    get savingsPercent() {
      return Math.round((1 - 17900 / (1649 * 12)) * 100);
    },
  },
} as const;

export interface SleepCollection {
  key: string;
  /** Our name for this strand of the library. */
  name: string;
  /** Plain-language description of the format, for anyone who has not met the name yet. */
  kind: string;
  tagline: string;
  description: string;
  /** lucide icon name, resolved by AssessmentIcon */
  icon: string;
}

/**
 * The three strands of the library. Deliberately described by what they
 * are, not by how popular they are.
 */
export const SLEEP_COLLECTIONS: SleepCollection[] = [
  {
    key: "soundscapes",
    name: "Stillwater",
    kind: "Soundscapes",
    tagline: "Steady sound, all night",
    description:
      "Long, unbroken recordings that hold the same character from the first minute to the last — rain on a window, a river under trees, the hum of a room fan. No swells, no surprises, nothing that resolves. Mixed to sit under your attention rather than draw it, and to loop without a seam you can hear.",
    icon: "waves",
  },
  {
    key: "stories",
    name: "Night Ferry",
    kind: "Sleep stories",
    tagline: "Somewhere else to put your mind",
    description:
      "Slow, gentle narration with somewhere to go and nowhere to arrive. Stories are written to lose the thread comfortably — if you drift at minute four you have missed nothing, because there is no ending you needed. Read at an unhurried pace, with the volume falling away as the piece goes on.",
    icon: "book-open",
  },
  {
    key: "music",
    name: "Slow Tide",
    kind: "Slow music",
    tagline: "Music with the edges taken off",
    description:
      "Original pieces written well under a resting heart rate, with no percussion, no sudden dynamics and no melody insistent enough to follow. Closer to weather than to songs — something to occupy the quiet without asking anything of you.",
    icon: "music",
  },
];

/** What the subscription actually includes. Nothing aspirational. */
export const SLEEP_FEATURES: { title: string; body: string }[] = [
  {
    title: "Built for the whole night",
    body: "Every soundscape runs long enough to cover a full night, with a sleep timer if you would rather it stopped. Nothing restarts, fades out unexpectedly, or announces itself at 3am.",
  },
  {
    title: "Download and go offline",
    body: "Anything in the library can be saved to your device, so a poor connection at bedtime is not a problem, and nothing needs to stream while you are asleep.",
  },
  {
    title: "Nothing to decide at midnight",
    body: "Pick up where you left off in a tap. The hardest thing about a sleep app should not be choosing what to play when you are already tired.",
  },
  {
    title: "Quiet by design",
    body: "No autoplay into something louder, no recommendations shouting for attention, no streaks to keep. It is a library, not a feed.",
  },
];

/**
 * Why a sleep product sits alongside cognitive assessments. This is the
 * honest version of the connection and stops short of anything clinical:
 * the platform measures memory, attention and processing speed, and sleep
 * is well established as affecting all three. That is a reason to offer it,
 * not a claim that listening will raise anyone's score.
 */
export const SLEEP_RATIONALE = {
  heading: "Why this sits next to your Brain Profile",
  body:
    "EvalOtter measures memory, attention and processing speed. Sleep affects all three — which is why a poor night shows up in a score long before it shows up anywhere else. Driftwater is offered because rest is the part of cognitive performance most people can actually change, not because listening to it will move your numbers.",
  disclaimer:
    "Driftwater is for rest and relaxation. It is not a medical device or a treatment for insomnia or any other condition, it makes no therapeutic claims, and it does not contribute to your EvalOtter score. If sleeplessness is affecting your health, please speak to a qualified clinician.",
} as const;
