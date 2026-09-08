import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Guarantees the signed-in user has a `profiles` row (and a brain profile)
 * before anything tries to reference it.
 *
 * Rows are normally created by the `on_auth_user_created` trigger at signup.
 * But an account created while that trigger was missing — or any future
 * failure of it — leaves a user who can sign in yet cannot start an
 * assessment: `assessment_attempts.user_id` is a foreign key to
 * `profiles(id)`, so the insert dies with a 23503 and the user sees an
 * opaque "A server error occurred".
 *
 * Rather than let a data gap become a dead end, we repair it on demand. This
 * needs the service-role client: there is deliberately no INSERT policy on
 * `profiles`, so a user-scoped client cannot create its own row.
 *
 * Cheap in the normal case — one indexed lookup on the primary key, and no
 * write at all once the row exists.
 */
export async function ensureProfileExists(user: {
  id: string;
  email?: string | null;
  fullName?: string | null;
}): Promise<void> {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return;

  const displayName = user.fullName ?? (user.email ? user.email.split("@")[0] : null);

  // Ignore conflicts: a concurrent request (or the trigger firing late) may
  // have created the row between the check above and this insert.
  await admin
    .from("profiles")
    .upsert({ id: user.id, full_name: user.fullName ?? null, display_name: displayName }, { onConflict: "id", ignoreDuplicates: true });

  const { count } = await admin
    .from("assessments")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");

  await admin
    .from("user_brain_profiles")
    .upsert({ user_id: user.id, assessments_total: count ?? 0 }, { onConflict: "user_id", ignoreDuplicates: true });
}
