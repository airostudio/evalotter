import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Server-to-server only — Perfect Love's backend calls this with a shared
 * secret, never a public/browser-facing link. That's the actual
 * anti-sharing mechanism: even if a code leaked, there's no unauthenticated
 * endpoint anyone can hit with it, only Perfect Love's own real checkout/
 * account flow can consume one. Redemption is a single atomic UPDATE ...
 * WHERE status = 'issued', so two concurrent redemption attempts for the
 * same code can't both succeed.
 */
export async function POST(request: NextRequest) {
  const sharedSecret = process.env.PERFECT_LOVE_API_SECRET;
  if (!sharedSecret) {
    return NextResponse.json({ error: "Perfect Love redemption is not configured" }, { status: 503 });
  }

  const provided = request.headers.get("x-perfect-love-secret") ?? "";
  if (!safeEqual(provided, sharedSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : null;

  if (!code) {
    return NextResponse.json({ error: "code is required" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: record } = await admin
    .from("perfect_love_codes")
    .select("id, user_id, status")
    .eq("code", code)
    .maybeSingle();

  if (!record) {
    return NextResponse.json({ valid: false, reason: "not_found" });
  }
  if (record.status !== "issued") {
    return NextResponse.json({ valid: false, reason: "already_redeemed" });
  }

  // Optional identity binding, checked BEFORE burning the code: if Perfect
  // Love passes the redeeming user's email, it must match the email of the
  // EvalOtter account that purchased this code. A mismatch leaves the code
  // untouched (still redeemable by its rightful owner) rather than wasting
  // it on a failed attempt.
  if (email) {
    const { data: owner } = await admin.auth.admin.getUserById(record.user_id);
    const ownerEmail = owner.user?.email?.toLowerCase();
    if (ownerEmail && ownerEmail !== email) {
      return NextResponse.json({ valid: false, reason: "email_mismatch" });
    }
  }

  const { data: redeemed, error } = await admin
    .from("perfect_love_codes")
    .update({
      status: "redeemed",
      redeemed_at: new Date().toISOString(),
      redeemed_by_email: email,
    })
    .eq("id", record.id)
    .eq("status", "issued")
    .select("user_id")
    .maybeSingle();

  if (error) {
    console.error("[perfect-love] redemption update failed:", error);
    return NextResponse.json({ error: "Redemption failed" }, { status: 500 });
  }

  // Another concurrent request won the race between the read above and this update.
  if (!redeemed) {
    return NextResponse.json({ valid: false, reason: "already_redeemed" });
  }

  return NextResponse.json({ valid: true, evalotterUserId: redeemed.user_id });
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
