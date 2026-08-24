import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types";

export interface AuthedUser {
  id: string;
  email: string | null;
  profile: Profile | null;
}

export async function getCurrentUser(): Promise<AuthedUser | null> {
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
