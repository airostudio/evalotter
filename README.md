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
5. Seed the catalogue (see **Status** below — seed data is not yet written).

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

## Status

Working end-to-end against a connected Supabase project: auth, the
assessment catalogue, a live-playable standard-questionnaire run (autosave,
resume, sections, timers), deterministic scoring, the results page with
charts, Brain Profile aggregation, and PDF report generation.

Not yet built:

- **Seed data** — the ten initial assessments exist as catalogue *copy*
  (`src/config/catalogue.ts`) but not as rows in `questions` /
  `assessment_questions` / etc. Several have real source content to port in
  from sibling repos (Logical Reasoning, Memory Recall, Verbal Reasoning,
  Verbal Intelligence, Emotional Intelligence, Creative Assessment, Spatial
  Intelligence); Metrics/Numerical Intelligence and Palmistry need to be
  authored fresh.
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

The logo is currently a placeholder (`src/components/marketing/BrandMark.tsx`
falls back to a generic icon + wordmark). Drop the real logo file at
`public/logo.svg` and swap in `BrandLogoImage` once it's available.
