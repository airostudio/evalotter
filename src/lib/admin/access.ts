import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types";
import { isAdminRole } from "@/lib/auth/roles";

export { isAdminRole };

/**
 * Admin access, tied to email addresses.
 *
 * `profiles.role` remains the authority — every gate and every RLS policy
 * reads it. ADMIN_EMAILS exists to solve the bootstrap problem: with a
 * role-only model the very first admin can only be created by hand-editing
 * the database, which is exactly what made /admin unreachable after the
 * project was rebuilt.
 *
 * Any address listed here is promoted to `admin` on sign-in. It is a floor,
 * never a ceiling: it will not demote anyone, and it will not downgrade an
 * existing super_admin. Day-to-day changes belong in the UI, which records
 * who made them; this is the way in when there is no admin to use it.
 *
 * Set it in the deploy environment, comma-separated:
 *   ADMIN_EMAILS=you@example.com,ops@example.com
 */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowlistedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}



/**
 * Promotes an allowlisted address that is not yet an admin. Called on
 * sign-in. Returns true only when it actually changed something, so the
 * caller can log it — a silent privilege grant is exactly the kind of event
 * an audit log exists for.
 */
export async function syncAdminFromAllowlist(
  userId: string,
  email: string | null | undefined
): Promise<boolean> {
  if (!isAllowlistedAdminEmail(email)) return false;

  const db = createAdminClient();
  const { data: profile } = await db
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!profile || isAdminRole(profile.role as UserRole)) return false;

  const { error } = await db.from("profiles").update({ role: "admin" }).eq("id", userId);
  if (error) {
    console.error("[admin/access] allowlist promotion failed:", error.message);
    return false;
  }

  await recordAdminAction({
    actorId: userId,
    actorEmail: email ?? null,
    action: "role.promote",
    targetType: "profile",
    targetId: userId,
    summary: `Promoted to admin automatically — ${email} is in ADMIN_EMAILS`,
    metadata: { previousRole: profile.role, newRole: "admin", source: "allowlist" },
  });

  return true;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(v: string | null | undefined): boolean {
  return typeof v === "string" && UUID_RE.test(v);
}

export interface AdminActionInput {
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  summary: string;
  metadata?: Record<string, unknown>;
}

/**
 * Appends to the audit log. Deliberately never throws: failing to record an
 * action must not roll back the action itself, and a swallowed log line is
 * less harmful than a 500 in the middle of an admin operation. Failures are
 * logged to the platform.
 */
export async function recordAdminAction(input: AdminActionInput): Promise<void> {
  try {
    const db = createAdminClient();
    await db.from("admin_activity").insert({
      actor_id: input.actorId,
      actor_email: input.actorEmail,
      action: input.action,
      entity_type: input.targetType ?? "system",
      // entity_id is uuid-typed; anything else goes in target_ref so a
      // slug, code or Stripe id is still recorded rather than dropped.
      entity_id: isUuid(input.targetId) ? input.targetId : null,
      target_ref: input.targetId ?? null,
      summary: input.summary,
      metadata: input.metadata ?? {},
    });
  } catch (err) {
    console.error("[admin/access] failed to write audit log:", err);
  }
}
