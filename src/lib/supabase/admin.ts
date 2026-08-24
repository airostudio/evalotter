import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Service-role Supabase client. Bypasses RLS entirely — use only in trusted
 * server contexts (Route Handlers, Server Actions, cron/background jobs)
 * that have already authorized the caller. NEVER import this from a
 * Client Component or expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase service role client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }

  return createSupabaseClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
