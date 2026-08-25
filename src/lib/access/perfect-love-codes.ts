import "server-only";
import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// Excludes visually-ambiguous characters (0/O, 1/I/L) so a user reading the
// code aloud or typing it in doesn't misenter it.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  const bytes = randomBytes(12);
  let chars = "";
  for (const b of bytes) chars += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return `PL-${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`;
}

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === "23505";
}

/**
 * Issues exactly one code per Stripe payment (idempotent on
 * `stripe_payment_intent_id`, so a webhook retry or the redirect-confirm
 * fallback racing the webhook never mints a second code for the same
 * purchase). The code itself is high-entropy and random — never derived
 * from the user id or email, so it can't be predicted.
 */
export async function issuePerfectLoveCode(userId: string, paymentIntentId: string): Promise<string | null> {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("perfect_love_codes")
    .select("code")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();
  if (existing) return existing.code;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const { error } = await admin.from("perfect_love_codes").insert({
      user_id: userId,
      code,
      stripe_payment_intent_id: paymentIntentId,
    });
    if (!error) return code;
    if (!isUniqueViolation(error)) {
      console.error("[perfect-love] failed to issue code:", error);
      return null;
    }
    // Unique violation on `code` (astronomically unlikely at this entropy) — retry with a fresh random code.
  }

  console.error("[perfect-love] exhausted retries generating a unique code for payment", paymentIntentId);
  return null;
}
