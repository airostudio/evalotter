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
2. Apply the migrations in `supabase/migrations/` in order (via the Supabase
   CLI or SQL editor).
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

**Known gap:** `memory_recall`-type questions (the ISLT shopping list, ADAS-Cog
word list, and SKT object-recognition items in Memory Recall) carry real
scoring config, but `src/lib/scoring/engine.ts` doesn't yet compare a
`recalled[]` answer against the study/distractor lists — those 3 of Memory
Recall's 24 questions currently score 0 at runtime. The other 21 (multiple
choice, timed choice) score correctly. Fixing it needs `studyItems`/
`distractorItems` threaded onto the real `Question` type (currently a
seed-authoring-only field) plus a recall-accuracy branch in `collectImpacts()`.

Run `npm run seed:validate` any time — it statically checks every seed file
for the two bug classes already caught once each while authoring this data:
a scoring dimension declared but never actually targeted by any question
(dead 0 on the results page), and a reused question scoring a dimension key
the reusing assessment never declared (silently contributes nothing there).

## Not yet built

- **Admin builder UI** — the schema and RLS support it, but there's no
  `/admin` assessment builder yet, only the data model it would write to.
- **Live AI interpretation calls** — the abstraction exists
  (`src/lib/ai/`) but isn't wired to a provider; needs `OPENAI_API_KEY` or
  `ANTHROPIC_API_KEY`.
- **Palmistry vision analysis** — capture flow and storage exist
  (`src/components/assessment/PalmistryCapture.tsx`,
  `palmistry_submissions` table); actual vision-model inference is a stub.
- **Stripe checkout** — the data model (`subscriptions`, `report_purchases`)
  is Stripe-ready but no checkout flow is wired up.

## Brand

The real logo lives at `public/logo.png` (rendered from a lossy JPEG whose
"no background" checkerboard was baked into the pixels rather than a real
alpha channel — see the git history for how it was recovered). It's usable
at header/footer/favicon sizes; if a clean vector or lossless source ever
turns up, it's worth re-generating `public/logo.png`, `src/app/icon.png`,
and `src/app/apple-icon.png` from it for a sharper result at large sizes.
