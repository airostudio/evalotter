import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Exchanges a Supabase auth code for a session.
 *
 * Every email Supabase sends — signup confirmation, magic link, password
 * reset — links back with a `?code=` that has to be traded for a session
 * before the user is actually logged in. This route did not exist, and
 * emailRedirectTo pointed straight at /dashboard, so following a
 * confirmation link landed on a protected page with no session and bounced
 * to /login. It went unnoticed because the project it was built against had
 * email confirmation disabled, so no such link was ever sent.
 *
 * `next` lets a link return the user where they started; it is constrained
 * to a path on this origin so the parameter cannot be used to bounce
 * someone to another site off the back of our domain.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/dashboard";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] code exchange failed:", error.message);
    return NextResponse.redirect(`${origin}/login?error=link_expired`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
