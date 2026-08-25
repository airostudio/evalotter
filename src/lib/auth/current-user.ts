import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types";

export interface AuthedUser {
  id: string;
  email: string | null;
  profile: Profile | null;
}

/**
 * Next.js throws special internal errors for control flow — dynamic-render
 * bailout (`cookies()`/`headers()` used during a static-render attempt),
 * `redirect()`, and `notFound()` — tagged with a `digest` starting with one
 * of these prefixes. Framework code upstream (page rendering, route
 * handlers) needs to see these propagate uncaught to behave correctly; a
 * generic try/catch that swallows them breaks static generation instead of
 * falling back to dynamic rendering.
 */
function isNextControlFlowError(err: unknown): boolean {
  const digest = (err as { digest?: unknown } | null)?.digest;
  return (
    typeof digest === "string" &&
    (digest === "DYNAMIC_SERVER_USAGE" ||
      digest.startsWith("NEXT_REDIRECT") ||
      digest === "NEXT_NOT_FOUND")
  );
}

/**
 * Called unconditionally from the root layout on every single page render
 * (via SiteHeader), so this must never throw on a genuine failure — a
 * misconfigured Supabase client (malformed URL/key), a transient network
 * failure, or an unexpected query error here would otherwise take down
 * every route in the app, the same failure mode the middleware had before
 * it was hardened to fail open. Degrades to "logged out" on any unexpected
 * error rather than crashing the page — but re-throws Next.js's own
 * internal control-flow errors (see `isNextControlFlowError`) since
 * swallowing those breaks the framework, not the app.
 */
export async function getCurrentUser(): Promise<AuthedUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return {
      id: user.id,
      email: user.email ?? null,
      profile: profile
        ? {
            id: profile.id,
            fullName: profile.full_name,
            displayName: profile.display_name,
            avatarUrl: profile.avatar_url,
            role: profile.role as UserRole,
            marketingOptIn: profile.marketing_opt_in,
            createdAt: profile.created_at,
            updatedAt: profile.updated_at,
          }
        : null,
    };
  } catch (err) {
    if (isNextControlFlowError(err)) throw err;
    console.error("[auth/current-user] getCurrentUser failed, treating as logged out:", err);
    return null;
  }
}

export async function requireUser(): Promise<AuthedUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentication required");
  return user;
}

export async function requireRole(roles: UserRole[]): Promise<AuthedUser> {
  const user = await requireUser();
  if (!user.profile || !roles.includes(user.profile.role)) {
    throw new Error("Insufficient permissions");
  }
  return user;
}
