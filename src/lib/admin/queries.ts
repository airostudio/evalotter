import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Admin data access. Every function here uses the service-role client, which
 * bypasses RLS entirely — so nothing in this module may be called from a
 * route that has not already passed `requireAdmin()` (see
 * src/app/admin/layout.tsx, which gates the whole /admin subtree).
 *
 * Emails live in auth.users, not profiles, which is the other reason these
 * need the service role rather than the caller's session client.
 */

export interface AdminOverview {
  totalUsers: number;
  newUsers30d: number;
  totalAttempts: number;
  completedAttempts: number;
  completionRate: number;
  revenueCents: number;
  revenue30dCents: number;
  payingUsers: number;
  conversionRate: number;
  aiInterpretations: number;
  palmistrySubmissions: number;
  publicShares: number;
}

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY).toISOString();

export async function getOverview(): Promise<AdminOverview> {
  const db = createAdminClient();

  const HEAD = { count: "exact" as const, head: true };
  const [
    { count: totalUsers },
    { count: newUsers30d },
    { count: totalAttempts },
    { count: completedAttempts },
    { count: aiInterpretations },
    { count: palmistrySubmissions },
    { count: publicShares },
  ] = await Promise.all([
    db.from("profiles").select("*", HEAD),
    db.from("profiles").select("*", HEAD).gte("created_at", daysAgo(30)),
    db.from("assessment_attempts").select("*", HEAD),
    db.from("assessment_attempts").select("*", HEAD).eq("status", "completed"),
    db.from("ai_interpretations").select("*", HEAD),
    db.from("palmistry_submissions").select("*", HEAD),
    db.from("assessment_results").select("*", HEAD).eq("is_public_share", true),
  ]);

  const { data: purchases } = await db
    .from("report_purchases")
    .select("user_id, amount_cents, created_at");

  const rows = purchases ?? [];
  const revenueCents = rows.reduce((sum, p) => sum + (p.amount_cents ?? 0), 0);
  const cutoff = daysAgo(30);
  const revenue30dCents = rows
    .filter((p) => p.created_at >= cutoff)
    .reduce((sum, p) => sum + (p.amount_cents ?? 0), 0);
  const payingUsers = new Set(rows.map((p) => p.user_id)).size;

  const attemptsTotal = totalAttempts ?? 0;
  const attemptsDone = completedAttempts ?? 0;
  const users = totalUsers ?? 0;

  return {
    totalUsers: users,
    newUsers30d: newUsers30d ?? 0,
    totalAttempts: attemptsTotal,
    completedAttempts: attemptsDone,
    completionRate: attemptsTotal > 0 ? attemptsDone / attemptsTotal : 0,
    revenueCents,
    revenue30dCents,
    payingUsers,
    conversionRate: users > 0 ? payingUsers / users : 0,
    aiInterpretations: aiInterpretations ?? 0,
    palmistrySubmissions: palmistrySubmissions ?? 0,
    publicShares: publicShares ?? 0,
  };
}

export interface AdminUserRow {
  id: string;
  email: string | null;
  fullName: string | null;
  role: string;
  createdAt: string;
  attempts: number;
  completed: number;
  spendCents: number;
}

/** One page of users, enriched with per-user attempt counts and spend. */
export async function listUsers(opts: { search?: string; limit?: number; offset?: number } = {}) {
  const db = createAdminClient();
  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;

  let profileQuery = db
    .from("profiles")
    .select("id, full_name, display_name, role, created_at", { count: "exact" })
    .order("created_at", { ascending: false });

  if (opts.search) profileQuery = profileQuery.ilike("full_name", `%${opts.search}%`);

  const { data: profiles, count } = await profileQuery.range(offset, offset + limit - 1);
  const ids = (profiles ?? []).map((p) => p.id);
  if (ids.length === 0) return { rows: [] as AdminUserRow[], total: count ?? 0 };

  const [{ data: attempts }, { data: purchases }] = await Promise.all([
    db.from("assessment_attempts").select("user_id, status").in("user_id", ids),
    db.from("report_purchases").select("user_id, amount_cents").in("user_id", ids),
  ]);

  // auth.users holds the email; listUsers is paginated, so fetch a page big
  // enough to cover this slice and index it by id.
  const emails = new Map<string, string | null>();
  const { data: authPage } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  for (const u of authPage?.users ?? []) emails.set(u.id, u.email ?? null);

  const rows: AdminUserRow[] = (profiles ?? []).map((p) => {
    const mine = (attempts ?? []).filter((a) => a.user_id === p.id);
    return {
      id: p.id,
      email: emails.get(p.id) ?? null,
      fullName: p.full_name ?? p.display_name ?? null,
      role: p.role,
      createdAt: p.created_at,
      attempts: mine.length,
      completed: mine.filter((a) => a.status === "completed").length,
      spendCents: (purchases ?? [])
        .filter((x) => x.user_id === p.id)
        .reduce((s, x) => s + (x.amount_cents ?? 0), 0),
    };
  });

  return { rows, total: count ?? 0 };
}

/** Everything about one user, for the drill-down view. */
export async function getUserDetail(userId: string) {
  const db = createAdminClient();

  const [{ data: profile }, { data: authUser }] = await Promise.all([
    db.from("profiles").select("*").eq("id", userId).maybeSingle(),
    db.auth.admin.getUserById(userId),
  ]);
  if (!profile) return null;

  const [{ data: attempts }, { data: results }, { data: purchases }, { data: brainDims }, { data: codes }] =
    await Promise.all([
      db
        .from("assessment_attempts")
        .select("id, status, progress_percent, started_at, completed_at, assessments(title, slug)")
        .eq("user_id", userId)
        .order("started_at", { ascending: false }),
      db
        .from("assessment_results")
        .select("id, attempt_id, overall_score, created_at, is_public_share, assessments(title, slug)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      db
        .from("report_purchases")
        .select("id, amount_cents, currency, created_at, stripe_payment_intent_id, assessments(title)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      db.from("brain_profile_dimensions").select("dimension_key, score").eq("user_id", userId),
      db.from("perfect_love_codes").select("code, status, issued_at, redeemed_at").eq("user_id", userId),
    ]);

  return {
    profile,
    email: authUser?.user?.email ?? null,
    lastSignInAt: authUser?.user?.last_sign_in_at ?? null,
    attempts: attempts ?? [],
    results: results ?? [],
    purchases: purchases ?? [],
    brainDimensions: brainDims ?? [],
    perfectLoveCodes: codes ?? [],
    spendCents: (purchases ?? []).reduce((s, p) => s + (p.amount_cents ?? 0), 0),
  };
}

/** Revenue rollups plus the raw ledger. */
export async function getFinancials() {
  const db = createAdminClient();

  const [{ data: purchases }, { data: codes }] = await Promise.all([
    db
      .from("report_purchases")
      .select("id, user_id, amount_cents, currency, created_at, stripe_payment_intent_id, assessments(title, slug)")
      .order("created_at", { ascending: false }),
    db.from("perfect_love_codes").select("code, status, issued_at, redeemed_at, redeemed_by_email").order("issued_at", { ascending: false }),
  ]);

  const rows = purchases ?? [];
  const byMonth = new Map<string, { cents: number; count: number }>();
  for (const p of rows) {
    const key = p.created_at.slice(0, 7); // YYYY-MM
    const cur = byMonth.get(key) ?? { cents: 0, count: 0 };
    cur.cents += p.amount_cents ?? 0;
    cur.count += 1;
    byMonth.set(key, cur);
  }

  const byAssessment = new Map<string, { cents: number; count: number }>();
  for (const p of rows) {
    const title = (p.assessments as { title?: string } | null)?.title ?? "Collection / bundle";
    const cur = byAssessment.get(title) ?? { cents: 0, count: 0 };
    cur.cents += p.amount_cents ?? 0;
    cur.count += 1;
    byAssessment.set(title, cur);
  }

  return {
    purchases: rows,
    totalCents: rows.reduce((s, p) => s + (p.amount_cents ?? 0), 0),
    byMonth: [...byMonth.entries()].sort((a, b) => b[0].localeCompare(a[0])),
    byAssessment: [...byAssessment.entries()].sort((a, b) => b[1].cents - a[1].cents),
    perfectLoveCodes: codes ?? [],
  };
}

/** Per-assessment funnel: started, completed, average score, revenue. */
export async function getAssessmentStats() {
  const db = createAdminClient();

  const [{ data: assessments }, { data: attempts }, { data: results }, { data: purchases }] = await Promise.all([
    db.from("assessments").select("id, title, slug, status, access").order("title"),
    db.from("assessment_attempts").select("assessment_id, status"),
    db.from("assessment_results").select("assessment_id, overall_score"),
    db.from("report_purchases").select("assessment_id, amount_cents"),
  ]);

  return (assessments ?? []).map((a) => {
    const mine = (attempts ?? []).filter((x) => x.assessment_id === a.id);
    const scores = (results ?? []).filter((x) => x.assessment_id === a.id).map((x) => Number(x.overall_score));
    const completed = mine.filter((x) => x.status === "completed").length;
    return {
      id: a.id,
      title: a.title,
      slug: a.slug,
      status: a.status,
      access: a.access,
      started: mine.length,
      completed,
      completionRate: mine.length > 0 ? completed / mine.length : 0,
      avgScore: scores.length > 0 ? scores.reduce((s, x) => s + x, 0) / scores.length : null,
      revenueCents: (purchases ?? [])
        .filter((p) => p.assessment_id === a.id)
        .reduce((s, p) => s + (p.amount_cents ?? 0), 0),
    };
  });
}

/** Most recent attempts across all users, for the activity feed. */
export async function getRecentAttempts(limit = 25) {
  const db = createAdminClient();
  const { data } = await db
    .from("assessment_attempts")
    .select("id, user_id, status, progress_percent, started_at, completed_at, assessments(title, slug)")
    .order("started_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Drill-downs
// ---------------------------------------------------------------------------

/** Audit trail, newest first. */
export async function getAuditLog(limit = 200) {
  const db = createAdminClient();
  const { data } = await db
    .from("admin_activity")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

/** Everyone holding elevated access, for the access-control panel. */
export async function listPrivilegedUsers() {
  const db = createAdminClient();
  const { data } = await db
    .from("profiles")
    .select("id, display_name, full_name, role, created_at")
    .in("role", ["editor", "admin", "super_admin"])
    .order("role", { ascending: false });
  return data ?? [];
}

/**
 * Per-question statistics for one assessment: how often each item is
 * answered correctly, and how long it takes. This is what tells you an item
 * is broken — a 0% or 100% correct rate means it is measuring nothing, and
 * that is how the unanswerable EI face questions would have been caught.
 */
export async function getAssessmentQuestionStats(slug: string) {
  const db = createAdminClient();

  const { data: assessment } = await db
    .from("assessments")
    .select("id, title, slug, current_version_id, status, access, difficulty")
    .eq("slug", slug)
    .maybeSingle();
  if (!assessment?.current_version_id) return null;

  const { data: links } = await db
    .from("assessment_questions")
    .select("order, section_id, questions(id, external_key, question_text, question_type), assessment_sections:section_id(name)")
    .eq("assessment_version_id", assessment.current_version_id)
    .order("order");

  const questionIds = (links ?? [])
    .map((l) => {
      const embed = l.questions as unknown;
      const one = (Array.isArray(embed) ? embed[0] : embed) as { id?: string } | null;
      return one?.id;
    })
    .filter((v): v is string => Boolean(v));

  const { data: correctOptions } = await db
    .from("question_options")
    .select("question_id, id")
    .in("question_id", questionIds.length ? questionIds : ["00000000-0000-0000-0000-000000000000"])
    .eq("is_correct", true);

  const correctByQuestion = new Map<string, Set<string>>();
  for (const o of correctOptions ?? []) {
    if (!correctByQuestion.has(o.question_id)) correctByQuestion.set(o.question_id, new Set());
    correctByQuestion.get(o.question_id)!.add(o.id);
  }

  const { data: responses } = await db
    .from("assessment_responses")
    .select("question_id, answer, response_time_ms")
    .in("question_id", questionIds.length ? questionIds : ["00000000-0000-0000-0000-000000000000"]);

  const agg = new Map<string, { answered: number; correct: number; totalMs: number; timed: number }>();
  for (const r of responses ?? []) {
    const a = agg.get(r.question_id) ?? { answered: 0, correct: 0, totalMs: 0, timed: 0 };
    a.answered += 1;
    const chosen = (r.answer as { optionId?: string } | null)?.optionId;
    if (chosen && correctByQuestion.get(r.question_id)?.has(chosen)) a.correct += 1;
    if (r.response_time_ms) {
      a.totalMs += Number(r.response_time_ms);
      a.timed += 1;
    }
    agg.set(r.question_id, a);
  }

  const questions = (links ?? []).map((l) => {
    const embed = l.questions as unknown;
    const q = (Array.isArray(embed) ? embed[0] : embed) as {
      id: string; external_key: string; question_text: string; question_type: string;
    };
    const a = agg.get(q.id) ?? { answered: 0, correct: 0, totalMs: 0, timed: 0 };
    return {
      id: q.id,
      key: q.external_key,
      text: q.question_text,
      type: q.question_type,
      section: (() => {
        const sec = l.assessment_sections as unknown;
        const one = (Array.isArray(sec) ? sec[0] : sec) as { name?: string } | null;
        return one?.name ?? null;
      })(),
      scorable: correctByQuestion.has(q.id),
      answered: a.answered,
      correct: a.correct,
      correctRate: a.answered > 0 ? a.correct / a.answered : null,
      avgSeconds: a.timed > 0 ? Math.round(a.totalMs / a.timed / 100) / 10 : null,
    };
  });

  return { assessment, questions };
}

/** AI interpretation health — volume, failures, and what they cost to retry. */
export async function getAiHealth() {
  const db = createAdminClient();
  const [{ count: total }, { count: failed }, { data: recent }] = await Promise.all([
    db.from("ai_interpretations").select("id", { count: "exact", head: true }),
    db.from("ai_interpretations").select("id", { count: "exact", head: true }).neq("status", "completed"),
    db
      .from("ai_interpretations")
      .select("id, status, created_at, result_id")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  return { total: total ?? 0, failed: failed ?? 0, recent: recent ?? [] };
}

/** Palmistry submissions — sensitive images, so this lists metadata only. */
export async function getPalmistryQueue(limit = 50) {
  const db = createAdminClient();
  const { data } = await db
    .from("palmistry_submissions")
    .select("id, user_id, status, created_at, attempt_id")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

/** Driftwater subscription health — the recurring revenue stream. */
export async function getSubscriptionStats() {
  const db = createAdminClient();
  const { data } = await db
    .from("subscriptions")
    .select("plan, status, current_period_end, created_at, user_id")
    .in("plan", ["sleep_monthly", "sleep_annual"])
    .order("created_at", { ascending: false });

  const rows = data ?? [];
  const live = rows.filter((r) => r.status === "active" || r.status === "trialing");
  const trialing = live.filter((r) => r.status === "trialing").length;
  const paying = live.filter((r) => r.status === "active");

  // Monthly recurring revenue from paying subscribers only — a trial has
  // not paid anything yet and counting it would overstate the number.
  const mrrCents = paying.reduce(
    (sum, r) => sum + (r.plan === "sleep_annual" ? Math.round(17900 / 12) : 1649),
    0
  );

  return {
    total: rows.length,
    live: live.length,
    trialing,
    paying: paying.length,
    canceled: rows.filter((r) => r.status === "canceled").length,
    pastDue: rows.filter((r) => r.status === "past_due").length,
    mrrCents,
    recent: rows.slice(0, 25),
  };
}
