import type { UserRole } from "@/types";

/**
 * Pure role predicates, deliberately free of `server-only` and of any
 * Supabase import, so UI that merely needs to know "should this be visible"
 * can use them without pulling the service-role client into its module
 * graph.
 *
 * These decide what is *shown*. They are never the authorization boundary —
 * that is the /admin layout's own check plus RLS.
 */
export function isAdminRole(role: UserRole | null | undefined): boolean {
  return role === "admin" || role === "super_admin";
}

export function isEditorOrAbove(role: UserRole | null | undefined): boolean {
  return role === "editor" || isAdminRole(role);
}
