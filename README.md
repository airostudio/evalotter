# EvalOtter

A database-driven assessment platform. Users complete cognitive, intelligence,
emotional, creative and self-discovery assessments from one account, and
results roll up into a single **Brain Profile**. New assessments are added
through data (categories, questions, scoring rules, result ranges) rather
than by writing new pages — see the architecture notes below.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres, Auth,
Storage) · Recharts · Framer Motion · pdf-lib for report generation.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase project keys
npm run dev
```

The site renders and is navigable with no Supabase project configured (auth
gating fails open on public routes — see `src/lib/supabase/middleware.ts`),
but nothing is playable end-to-end until a real database is connected:

1. Create a Supabase project.
2. Apply the schema: paste `supabase/combined_migrations.sql` into the
   Supabase SQL editor and run it. **This is destructive** — it opens with
   a teardown block that drops every EvalOtter table, type, function,
   storage object, and storage bucket before rebuilding the schema from
   `supabase/migrations/0001` through the latest, so it's safe to re-run
   any time you want a clean slate. Every drop is `if exists`, so it's also
   safe against a brand-new empty project. **Only run it against a project
   with no data you need to keep** — if you ever have real user data, strip
   the teardown block (everything before the first `commit;`) and apply
   `supabase/migrations/*.sql` incrementally instead, or use the Supabase
   CLI's migration runner on the individual files.
3. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (and in your deploy
   environment — a missing/misconfigured Supabase config used to crash
   every route via `MIDDLEWARE_INVOCATION_FAILED`; it now fails open, but
   auth and assessment-taking still need real credentials to work).
4. Regenerate `src/lib/supabase/database.types.ts` from the real schema:
   `npx supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts`
5. Seed the catalogue: `npm run seed:validate` (static checks, no DB) then
   `npm run seed` (writes to the connected project — see **Seed data** below).

## Architecture

- **Assessments are data, not code.** `assessments`, `assessment_versions`,
  `assessment_sections`, `questions`, `assessment_questions`,
  `scoring_dimensions`, `scoring_rules`, and `result_ranges` (see
  `supabase/migrations/0001_core_schema.sql`) fully describe an assessment.
  Publishing a new one is an admin/data operation, not a deploy.
- **Assessment engines** (`src/lib/assessment-engine/`) are a registry keyed
  by `Assessment.engineType` (`standard_questionnaire`, `timed_questionnaire`,
  `hybrid`, `vision_analysis`, …). Each engine supplies a renderer, a
  deterministic scoring function, and an optional custom result renderer —
  new assessment *kinds* are added by registering a new engine, never by
  branching the runner or results page on assessment identity.
- **Question types** (`src/components/questions/`) are similarly registered
  by type (`multiple_choice`, `likert_scale`, `sequence`, `image_choice`,
  …), so new question UI slots into the runner without touching it.
- **Scoring is deterministic** (`src/lib/scoring/engine.ts`): raw responses
  plus a version's scoring rules and result ranges produce dimension and
  overall scores. AI (`src/lib/ai/`) only interprets that output afterwards
  — it never influences the number.
- **Versioning**: attempts store `assessment_version_id`, not just
  `assessment_id`. Editing a published assessment's questions or scoring
  means publishing a new version; historical attempts stay pinned to the
  version they were taken under.
- **Brain Profile aggregation is rule-based**, not implicit — see
  `brain_profile_contribution_rules` and `src/lib/scoring/brain-profile.ts`.
  An assessment only feeds the aggregate profile if a rule says so, which is
  how Palmistry stays excluded from the cognitive score by construction
  rather than by convention.
- **RLS**: every user-owned table (attempts, responses, results, uploaded
  media, palmistry submissions, reports) is locked to `auth.uid()`; the
  catalogue (assessments, questions, scoring config) is public-read,
  editor/admin-write. See `supabase/migrations/0003_row_level_security.sql`.

## Seed data

`scripts/seed/data/*.json` holds real content for all ten launch assessments
(192 questions total) — mostly ported verbatim from sibling single-purpose
repos rather than invented, with the porting decisions and any gaps recorded
per-file in each JSON's `sourceNote`:

| Assessment | Source | Notes |
|---|---|---|
| Logical Reasoning | `airostudio/logical-reasoning` | 15 real questions (source has no more) |
| Memory Recall | `airostudio/Memory-Recall-Test` | plain HTML/JS app — see known gap below |
| Verbal Reasoning | `airostudio/VerbRea` | 24 questions, verbatim |
| Verbal Intelligence | `airostudio/verbalize` | 40 questions, verbatim |
| Emotional Intelligence | `airostudio/Emotional-Intelligence` | 40 questions across 9 EQ-i/MSCEIT facets |
| Creative Assessment | `airostudio/Creative-Assessment` | 13 scored + 2 open-ended (AI-interpreted only) |
| Spatial Intelligence | `airostudio/spacial-intelligence` | 10 real questions (source has no more) |
| Metrics / Numerical Intelligence | — | no source repo existed; authored fresh |
| Palmistry | — | no source repo existed; authored fresh, no scoring |
| EvalOtter Intelligence Profile (flagship) | shared library | composed by reusing real questions from the assessments above — see below |

Four former "coming soon" entries have since been built out the same way,
each modeled on a real, named, world-standard instrument rather than
invented from scratch — see **Graduated coming-soon assessments** below for
the copyright caveat that applies to all of them.

| Assessment | Modeled on | Notes |
|---|---|---|
| Critical Thinking Depth | Watson-Glaser Critical Thinking Appraisal | 20 questions across its 5 published subskills (Inference, Recognition of Assumptions, Deduction, Interpretation, Evaluation of Arguments) |
| Phonological Awareness | CTOPP-2 (Comprehensive Test of Phonological Processing) | 24 questions across its Elision/Blending Words/Sound Matching subtests — text-adapted, see caveat below |
| Social Cognition Assessment | Happé's Strange Stories Task | 20 vignettes across its documented non-literal-language types (lie, white lie, joke, irony, figure of speech, misunderstanding, persuasion, pretense) — forced-choice adaptation, see caveat below |
| Numerical Agility | Wonderlic Personnel Test (numerical subset) | 24 questions (arithmetic, ratios, number series, word problems) under one 10-minute overall clock, matching the Wonderlic's speed-over-power design |

**The flagship deliberately does not port the old `airostudio/brainyak`
repo's "pattern recognition" content.** That repo hardcodes
`correctAnswer: 0` for every one of its 15 questions regardless of the
actual image shown (`src/data/questions.ts` / `src/store/testStore.ts`) —
its IQ score was cosmetic, not a real measurement. Shipping that would mean
this platform's own flagship assessment silently scored on fabricated
correctness. Instead the flagship composes itself from real, legitimately-
scored questions already defined for the single-domain assessments, via
`reuseQuestionKeys` — the intended use of the shared question library
(`questions` rows are reused across `assessment_questions`, not duplicated).

**Memory Recall scores fully correctly (all 24 questions).** The ISLT
shopping list and SKT object-recognition items are `memory_recognition`
type — a study phase (`src/components/questions/MemoryRecognitionQuestion.tsx`)
followed by a recognition grid, answered as `multiple_select` so they reuse
the already-correct option-based scoring path. The ADAS word list stays
`memory_recall` (true free recall,
`src/components/questions/MemoryRecallQuestion.tsx`), scored by a dedicated
`collectImpacts()` branch that compares typed entries against the
question's options (its ground-truth word list) case-insensitively.

Run `npm run seed:validate` any time — it statically checks every seed file
for the two bug classes already caught once each while authoring this data:
a scoring dimension declared but never actually targeted by any question
(dead 0 on the results page), and a reused question scoring a dimension key
the reusing assessment never declared (silently contributes nothing there).

## Graduated coming-soon assessments

Critical Thinking Depth, Phonological Awareness, Social Cognition
Assessment, and Numerical Agility have moved from the roadmap into real,
scored assessments (see the table above) — the first batch of the
remaining 14. The approach for all of them, and for whichever get built out
next:

- **Research the real, named, world-standard instrument for the domain
  first**, then model the assessment's structure (subtests/facets, item
  types, scoring logic) on it — the same thing Emotional Intelligence
  already did with EQ-i/MSCEIT.
- **Never reproduce the actual copyrighted items.** Watson-Glaser, CTOPP-2,
  the Wonderlic, etc. are commercially licensed instruments — their real
  passages/stimuli/norms aren't reproduced here. What's ported is the
  *paradigm* (the skills it isolates, how it's structured, how it's
  scored), with original items written to implement that paradigm — the
  same approach legitimate cognitive-assessment platforms use.
- **Only build what the existing infrastructure can score for real.** Two
  domains were deliberately skipped for this batch: Attention Control
  Test/Speed Processing Index (a genuine Stroop or processing-speed measure
  needs response-time-weighted scoring, which `timed_choice` captures the
  data for but `collectImpacts()` doesn't yet use — see
  `src/lib/scoring/engine.ts`) and Abstract Reasoning Pro/Visuospatial
  Rotation (Raven's-style matrices and the Vandenberg & Kuse Mental
  Rotation Test need real rendered visuals; `pattern_question`/
  `visual_rotation` currently fall back to `ImageChoiceQuestion.tsx`'s
  plain-text-label mode with no image asset pipeline behind it — building
  these without real images would mean a text-description task masquerading
  as a visual reasoning test). Both are legitimate infrastructure work for
  a future batch, not something to fake around.
- **Note real adaptations openly, in the file's `sourceNote`.**
  Phonological Awareness's source (CTOPP-2) is administered orally; this
  platform has no audio-recording input, so every item is presented and
  answered as text instead — that measures the same phonemic-manipulation
  skill, but not auditory perception specifically. Social Cognition's
  source (Happé's Strange Stories) is normally scored from open verbal
  explanations hand-coded by a researcher; this version uses forced-choice
  answers instead, so it's an easier recognition task than the original's
  free explanation, not different.

`npm run seed:validate` catches structural bugs before any of this reaches
a database — always run it on new content before `npm run seed`.

## Coming-soon assessments

`scripts/seed/data/coming-soon.json` now holds the remaining 14 roadmap
entries (Verbal Reasoning Mastery, Memory Palace Challenge, Creative
Divergent Thinking, Speed Processing Index, Executive Function Profiling,
Visuospatial Rotation, Auditory Processing Speed, Attention Control Test,
Abstract Reasoning Pro, Decision Making Under Pressure, Cognitive
Flexibility Index, Language Acquisition, Fluid Intelligence Peak, Career
Aptitude Profile, Full IQ Estimation Report) with catalogue metadata
only — no sections, questions, or scoring. They're `status: "coming_soon"`
(a distinct DB status from `draft`, since coming-soon entries are
deliberately public-facing — see `0007`/`0008` migrations for the enum
value and RLS policy). The catalogue shows them with a "Coming soon" badge
and a disabled button (`AssessmentCard.tsx`, `assessments/[slug]/page.tsx`).

To build one out later: rename its entry in `coming-soon.json` out of that
file into its own `scripts/seed/data/<slug>.json` matching the shape of the
ten real assessments (see any of those for the pattern), add real
sections/questions/scoringDimensions/resultRanges, drop `"status":
"coming_soon"` so it defaults to `"published"`, then `npm run seed:validate`
and `npm run seed`.

## AI interpretation & Palmistry vision

Both are fully wired to Claude (`src/lib/ai/client.ts`, using
`@anthropic-ai/sdk`) — set `ANTHROPIC_API_KEY` to enable them; without it
they degrade gracefully rather than failing:

- **Interpretation** (`src/lib/ai/interpretation.ts`): runs after every
  completed attempt (`completeAttemptAction` in `src/actions/attempts.ts`),
  strictly after deterministic scoring — it receives the already-computed
  scores (plus any `open_creative`/`long_text` answers, which is what makes
  Creative Assessment's two open-ended prompts actually get used) and
  returns a structured interpretation persisted to `ai_interpretations`,
  rendered on the results page. Never blocks or alters the deterministic
  result if the call fails or no key is configured.
- **Palmistry vision** (`src/lib/ai/palmistry-vision.ts`): fetches both
  stored palm photos from Supabase Storage server-side, sends them to a
  vision-capable Claude model with the person's context answers, and parses
  the structured reading. Explicitly framed as entertainment/self-reflection
  in the prompt itself, not just the UI copy.

I haven't been able to test either against a live key in this environment
(no ANTHROPIC_API_KEY here) — the JSON-parsing, error handling, and
graceful-degradation paths are exercised, but not a real model response.
Worth a manual check once a key is configured.

## Monetization

Every assessment is free to *take*, start to finish, and scored the moment
you finish — deterministically, same as always. What's paywalled is the
**results view**: `src/app/results/[attemptId]/page.tsx` blurs the score,
dimension breakdown, strengths/development areas, and AI interpretation
(`src/components/results/LockedOverlay.tsx`) behind a popup
(`ResultsPaywall.tsx`) that opens automatically once results are ready.
Palmistry's reading is gated the same way. Nothing fake is ever shown in the
locked state — the real computed values are blurred via CSS, never
substituted with placeholder numbers.

Three one-time Stripe Checkout options, no subscriptions:

| Tier | Price | Grants |
|---|---|---|
| Single report | $1.99 | Full results for one assessment (`report_purchases` row, keyed by assessment) |
| Full collection | $18.99 | Full results for every assessment, forever (`subscriptions` row, `plan = 'full_profile_one_off'`) |
| Full collection + Perfect Love | $39.99 | The above, plus [Perfect Love](https://perfectlove.site) access — see caveat below |

The pricing page (`/pricing`) lists every published assessment individually
at $1.99 (buyable ahead of taking it, not just from its results page) plus
the two collection tiers.

**Setup**: set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`. Prices are
passed inline via Stripe's `price_data` in
`src/app/api/stripe/checkout/route.ts` — there's nothing to pre-create as a
Product/Price in the Stripe Dashboard. Register
`/api/stripe/webhook` in the Stripe Dashboard (or `stripe listen
--forward-to localhost:3000/api/stripe/webhook` locally) for the
`checkout.session.completed` event — that's the source of truth for
recording a purchase. The results page also confirms a session immediately
on redirect (`confirmCheckoutSessionAction` in `src/actions/checkout.ts`)
for instant unlock UX, verified against Stripe itself (not trusted from the
URL), idempotent against the webhook via a unique constraint on
`stripe_payment_intent_id` (migration `0009_monetization.sql`).

**Perfect Love fulfillment**: `perfectlove.site` is a separate platform, so
there's no shared database or account system — fulfillment is a one-time
redemption code, not an automatic account grant.

- On a `collection_plus_love` purchase, `issuePerfectLoveCode()`
  (`src/lib/access/perfect-love-codes.ts`) mints a high-entropy random code
  (`PL-XXXX-XXXX-XXXX`, never derived from the user id/email) and stores it
  in `perfect_love_codes`, idempotent per Stripe payment intent so a webhook
  retry can't mint a second one. The user sees their code on `/dashboard`
  (`PerfectLoveCodeCard.tsx`) to copy and redeem themselves.
- Perfect Love's *backend* redeems it server-to-server against
  `POST /api/perfect-love/redeem`, authenticated with a shared secret
  (`PERFECT_LOVE_API_SECRET`, sent as the `X-Perfect-Love-Secret` header —
  there's no public/browser-facing redemption link, which is the actual
  anti-sharing mechanism: a leaked code is useless without going through
  Perfect Love's own real checkout). Redemption is a single atomic
  `UPDATE ... WHERE status = 'issued'`, so two concurrent redemption
  attempts for the same code can't both succeed, and an optional `email` in
  the request is checked against the purchasing account's email *before*
  the code is burned, so a wrong guess doesn't waste it.
- **What's still needed on Perfect Love's side**: an actual call to this
  endpoint from their checkout/redemption flow, and whatever they do with
  `{ valid: true, evalotterUserId }` on success (grant the "full package"
  entitlement in their own system). That part lives in their codebase, not
  this one — nothing to build here until it's specced.

## Not yet built

- **Admin builder UI** — the schema and RLS support it, but there's no
  `/admin` assessment builder yet, only the data model it would write to.
- **Perfect Love's redemption call** — see the fulfillment section above;
  EvalOtter's side (issue, display, verify, atomically redeem) is complete,
  Perfect Love's side (actually calling the endpoint and granting access)
  is not, since it lives in a different codebase.

## Brand

The source logo is `public/evalotter-logo26.png` — a clean lockup (otter
mark + "EVALOTTER.COM" wordmark) with a real alpha channel. `public/logo.png`,
`src/app/icon.png`, and `src/app/apple-icon.png` are the mark cropped out of
it, auto-trimmed and padded to a square, at 512×512/512×512/180×180
respectively (`BrandMark.tsx` renders it small next to the site's own
"EvalOtter" text, so only the glyph is needed there, not the wordmark). If
the source logo is ever replaced, regenerate those three from the same crop
so they stay in sync.
