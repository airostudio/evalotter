"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isAdminRole, recordAdminAction } from "@/lib/admin/access";
import type { UserRole } from "@/types";

const ASSIGNABLE: UserRole[] = ["user", "editor", "admin", "super_admin"];

/**
 * Every action here re-checks the caller. The admin layout gates the UI,
 * but a server action is a public endpoint — it can be invoked directly and
 * does not inherit the layout's guard.
 */
async function requireAdminActor() {
  const user = await getCurrentUser();
  if (!user || !isAdminRole(user.profile?.role)) {
    throw new Error("Not authorized");
  }
  return user;
}

export async function setUserRoleAction(targetUserId: string, role: string) {
  const actor = await requireAdminActor();

  if (!ASSIGNABLE.includes(role as UserRole)) throw new Error("Unknown role");

  // Only a super_admin may create or unmake another super_admin, so a
  // regular admin cannot quietly promote themselves past their own level.
  if (role === "super_admin" && actor.profile?.role !== "super_admin") {
    throw new Error("Only a super admin can grant super admin");
  }

  const db = createAdminClient();
  const { data: target } = await db
    .from("profiles")
    .select("id, role, display_name")
    .eq("id", targetUserId)
    .maybeSingle();
  if (!target) throw new Error("User not found");

  if (target.role === "super_admin" && actor.profile?.role !== "super_admin") {
    throw new Error("Only a super admin can change another super admin");
  }

  // Losing the last admin locks everyone out of this area permanently —
  // the only way back would be editing the database by hand.
  if (isAdminRole(target.role as UserRole) && !isAdminRole(role as UserRole)) {
    const { count } = await db
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .in("role", ["admin", "super_admin"]);
    if ((count ?? 0) <= 1) throw new Error("This is the last admin — promote someone else first");
  }

  const { error } = await db.from("profiles").update({ role }).eq("id", targetUserId);
  if (error) throw error;

  await recordAdminAction({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "role.change",
    targetType: "profile",
    targetId: targetUserId,
    summary: `Changed ${target.display_name ?? targetUserId} from ${target.role} to ${role}`,
    metadata: { previousRole: target.role, newRole: role },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${targetUserId}`);
}

/**
 * Grants a report without payment — comping a refund case, a support
 * gesture, or a press/reviewer account. Recorded, because it is money.
 */
export async function grantReportAccessAction(targetUserId: string, assessmentId: string, note: string) {
  const actor = await requireAdminActor();
  const db = createAdminClient();

  const { data: assessment } = await db
    .from("assessments").select("title").eq("id", assessmentId).maybeSingle();

  const { error } = await db.from("report_purchases").insert({
    user_id: targetUserId,
    assessment_id: assessmentId,
    amount_cents: 0,
    currency: "usd",
    stripe_payment_intent_id: null,
  });
  if (error) throw error;

  await recordAdminAction({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "access.grant",
    targetType: "profile",
    targetId: targetUserId,
    summary: `Granted "${assessment?.title ?? assessmentId}" at no charge${note ? ` — ${note}` : ""}`,
    metadata: { assessmentId, note, amountCents: 0 },
  });

  revalidatePath(`/admin/users/${targetUserId}`);
}
