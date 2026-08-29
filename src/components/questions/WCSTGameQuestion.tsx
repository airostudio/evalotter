"use client";

import { useMemo, useRef, useState } from "react";
import { clsx } from "clsx";
import type { QuestionComponentProps } from "./registry";

/**
 * A real, adaptive Wisconsin Card Sorting Test — parameterized after the
 * published WCST-64 short form (64 cards, 4 categories). Unlike every
 * other question type, the "correct answer" isn't fixed at authoring time:
 * it's inferred by the player from right/wrong feedback, and the hidden
 * rule silently shifts after 6 consecutive correct sorts. That live
 * feedback loop — impossible to fake with a static pre-scored question —
 * is the entire point of WCST, which is why this had to be a real
 * interactive component rather than seed content.
 *
 * Reports a single normalized 0-1 `score` back through
 * `{ type: "custom_interactive", payload }`, which the generic
 * custom_interactive scoring branch (src/lib/scoring/engine.ts) scales the
 * question's scoreConfig by — the same pattern a slider or rating scale
 * uses, just computed by the game itself instead of read directly off the
 * answer.
 */

type Rule = "color" | "shape" | "count";
type Shape = "triangle" | "star" | "diamond" | "circle";
type Color = "#ef4444" | "#10b981" | "#f59e0b" | "#6366f1";

const SHAPES: Shape[] = ["triangle", "star", "diamond", "circle"];
const COLORS: Color[] = ["#ef4444", "#10b981", "#f59e0b", "#6366f1"];
const COUNTS = [1, 2, 3, 4];
const RULE_SEQUENCE: Rule[] = ["color", "shape", "count"];
const STREAK_TO_SHIFT = 6;
const MAX_TRIALS = 64;
const TARGET_CATEGORIES = 4;

interface Card {
  shape: Shape;
  color: Color;
  count: number;
}

const KEY_CARDS: Card[] = [
  { shape: "triangle", color: "#ef4444", count: 1 },
  { shape: "star", color: "#10b981", count: 2 },
  { shape: "diamond", color: "#f59e0b", count: 3 },
  { shape: "circle", color: "#6366f1", count: 4 },
];

function shapePath(shape: Shape, cx: number, cy: number, r: number): string {
  if (shape === "circle") return "";
  const n = shape === "triangle" ? 3 : shape === "diamond" ? 4 : 10;
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const isInner = shape === "star" && i % 2 === 1;
    const radius = isInner ? r * 0.45 : r;
    const angle = (-90 + i * (360 / n)) * (Math.PI / 180);
    pts.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`);
  }
  return pts.join(" ");
}

function CardShape({ shape, color, count }: { shape: Shape; color: string; count: number }) {
  const spacing = 26;
  const totalW = spacing * (count - 1);
  const startX = 50 - totalW / 2;
  return (
    <svg viewBox="0 0 100 100" className="h-16 w-16">
      {Array.from({ length: count }).map((_, i) => {
        const cx = count === 1 ? 50 : startX + i * spacing;
        return shape === "circle" ? (
          <circle key={i} cx={cx} cy={50} r={14} fill={color} />
        ) : (
          <polygon key={i} points={shapePath(shape, cx, 50, 14)} fill={color} />
        );
      })}
    </svg>
  );
}

function generateDeck(): Card[] {
  const deck: Card[] = [];
  for (let i = 0; i < MAX_TRIALS; i++) {
    deck.push({
      shape: SHAPES[Math.floor(Math.random() * 4)]!,
      color: COLORS[Math.floor(Math.random() * 4)]!,
      count: COUNTS[Math.floor(Math.random() * 4)]!,
    });
  }
  return deck;
}

function matches(card: Card, key: Card, rule: Rule): boolean {
  if (rule === "color") return card.color === key.color;
  if (rule === "shape") return card.shape === key.shape;
  return card.count === key.count;
}

export function WCSTGameQuestion({ onChange }: QuestionComponentProps) {
  const deck = useMemo(() => generateDeck(), []);
  const [trialIndex, setTrialIndex] = useState(0);
  const [ruleIndex, setRuleIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [categoriesCompleted, setCategoriesCompleted] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [perseverativeErrors, setPerseverativeErrors] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [done, setDone] = useState(false);
  const justShiftedRuleIndex = useRef<number | null>(null);
  const busy = useRef(false);

  const rule = RULE_SEQUENCE[ruleIndex % RULE_SEQUENCE.length]!;
  const currentCard: Card | undefined = deck[trialIndex];
  const finished = done || trialIndex >= MAX_TRIALS || categoriesCompleted >= TARGET_CATEGORIES;

  function submit(payload: Record<string, unknown>) {
    onChange({ type: "custom_interactive", payload });
  }

  function finish(finalCategories: number, finalErrors: number, finalPersev: number, trialsUsed: number) {
    const completionScore = finalCategories / TARGET_CATEGORIES;
    const perseverationRate = trialsUsed > 0 ? finalPersev / trialsUsed : 0;
    const score = Math.max(0, Math.min(1, completionScore * 0.7 + (1 - perseverationRate) * 0.3));
    setDone(true);
    submit({
      score,
      categoriesCompleted: finalCategories,
      totalTrials: trialsUsed,
      totalErrors: finalErrors,
      perseverativeErrors: finalPersev,
    });
  }

  function chooseKey(keyIdx: number) {
    if (busy.current || finished || !currentCard) return;
    busy.current = true;

    const card = currentCard;
    const chosenKey = KEY_CARDS[keyIdx]!;
    const isCorrect = matches(card, chosenKey, rule);

    let nextStreak = streak;
    let nextErrors = totalErrors;
    let nextPersev = perseverativeErrors;
    let nextCategories = categoriesCompleted;
    let nextRuleIndex = ruleIndex;

    if (isCorrect) {
      nextStreak += 1;
      setFeedback("correct");
    } else {
      nextErrors += 1;
      setFeedback("incorrect");
      // Perseverative error: the chosen key would have been correct under
      // the rule active immediately before the last shift — the classic
      // WCST signal of rigidly sticking with an old, no-longer-correct rule.
      if (justShiftedRuleIndex.current !== null) {
        const prevRule = RULE_SEQUENCE[justShiftedRuleIndex.current % RULE_SEQUENCE.length]!;
        if (matches(card, chosenKey, prevRule)) nextPersev += 1;
      }
      nextStreak = 0;
    }

    if (nextStreak >= STREAK_TO_SHIFT) {
      nextCategories += 1;
      justShiftedRuleIndex.current = nextRuleIndex;
      nextRuleIndex += 1;
      nextStreak = 0;
    }

    setStreak(nextStreak);
    setTotalErrors(nextErrors);
    setPerseverativeErrors(nextPersev);
    setCategoriesCompleted(nextCategories);
    setRuleIndex(nextRuleIndex);

    const nextTrialIndex = trialIndex + 1;

    setTimeout(() => {
      setFeedback(null);
      busy.current = false;
      if (nextCategories >= TARGET_CATEGORIES || nextTrialIndex >= MAX_TRIALS) {
        finish(nextCategories, nextErrors, nextPersev, nextTrialIndex);
      } else {
        setTrialIndex(nextTrialIndex);
      }
    }, 550);
  }

  if (finished) {
    return (
      <div className="rounded-xl2 border border-ink-700 bg-ink-800/40 p-6 text-center">
        <p className="text-sm text-paper-100/70">
          Sorted {trialIndex} card{trialIndex === 1 ? "" : "s"}, completed {categoriesCompleted} of{" "}
          {TARGET_CATEGORIES} categories.
        </p>
        <p className="mt-2 text-xs text-paper-100/40">Move on to the next question when ready.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="max-w-md text-center text-sm text-paper-100/60">
        Sort the card below under one of the four key cards. You&apos;ll be told if you&apos;re
        right or wrong — the matching rule isn&apos;t told to you, and it changes without warning
        once you find it.
      </p>

      <div className="flex gap-4">
        {KEY_CARDS.map((key, i) => (
          <button
            key={i}
            type="button"
            onClick={() => chooseKey(i)}
            disabled={busy.current}
            className="focus-ring flex h-24 w-24 items-center justify-center rounded-xl2 border border-ink-600 bg-ink-800/60 hover:border-signal-cyan/50 disabled:opacity-60"
          >
            <CardShape shape={key.shape} color={key.color} count={key.count} />
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-2">
        <div
          className={clsx(
            "flex h-28 w-28 items-center justify-center rounded-xl2 border-2 bg-ink-900/60 transition-colors",
            feedback === "correct" && "border-green-500",
            feedback === "incorrect" && "border-red-500",
            !feedback && "border-ink-600"
          )}
        >
          {currentCard && <CardShape shape={currentCard.shape} color={currentCard.color} count={currentCard.count} />}
        </div>
        {feedback && (
          <span className={clsx("text-sm font-medium", feedback === "correct" ? "text-green-400" : "text-red-400")}>
            {feedback === "correct" ? "Correct" : "Incorrect"}
          </span>
        )}
      </div>

      <p className="text-xs text-paper-100/35">
        Card {trialIndex + 1} of up to {MAX_TRIALS} · {categoriesCompleted}/{TARGET_CATEGORIES} categories found
      </p>
    </div>
  );
}
