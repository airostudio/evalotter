import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

const PROTECTED_PREFIXES = ["/dashboard", "/brain-profile", "/admin", "/results"];
const ADMIN_PREFIXES = ["/admin"];

/**
 * A hung network call (Supabase slow/unreachable from the edge region) never
 * throws, so a bare `await` on it isn't caught by try/catch — the platform's
 * own middleware execution limit eventually kills the invocation instead,
 * surfacing as a much worse, opaque MIDDLEWARE_INVOCATION_TIMEOUT/504 to the
 * user. Racing every Supabase call against a short internal timeout turns
 * that into a normal, catchable error well before the platform limit, so the
 * existing fail-open handling below actually gets to run.
 */
function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Supabase call timed out after ${ms}ms`)), ms);
    Promise.resolve(promise).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Without Supabase configured there's no session to check. Let the
  // request through rather than throwing — a crashed middleware takes down
  // every route (matcher covers the whole site), which is far worse than
  // temporarily skipping auth-gating. Pages that require a user still call
  // requireUser() server-side and will redirect/error there.
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[middleware] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set — skipping auth checks."
      );
    }
    return response;
  }

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));
  const isAdminRoute = ADMIN_PREFIXES.some((p) => path.startsWith(p));

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await withTimeout(supabase.auth.getUser(), 5000);

    if (isProtected && !user) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("next", path);
      return NextResponse.redirect(redirectUrl);
    }

    if (isAdminRoute && user) {
      const { data: profile } = await withTimeout(
        supabase.from("profiles").select("role").eq("id", user.id).single(),
        5000
      );

      const role = (profile as { role?: string } | null)?.role;
      if (role !== "admin" && role !== "super_admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    return response;
  } catch (error) {
    // A transient Supabase/network failure shouldn't 500 the whole site.
    // Fail open for public routes; still send protected routes to login
    // since we can't verify a session.
    console.error("[middleware] Supabase session check failed:", error);
    if (isProtected) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("next", path);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }
}
