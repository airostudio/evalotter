"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { syncAdminFromAllowlist } from "@/lib/admin/access";

const emailSchema = z.string().email();
const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

/**
 * Turns a Supabase auth error into something a visitor can act on.
 *
 * These messages were previously passed through verbatim, so a signup that
 * tripped the email quota told the user "email rate limit exceeded" — true,
 * but it reads as a fault in their own account and gives them nothing to do.
 * Supabase's built-in email service allows only 2 messages per hour and is
 * documented as unsuitable for production; a project without custom SMTP
 * configured will hit this constantly.
 *
 * Unrecognised errors still surface their original text rather than a
 * generic apology — an unexpected message we can read is worth more than a
 * polished one that hides what happened.
 */
function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();

  if (m.includes("rate limit") || m.includes("too many requests")) {
    return "We've sent too many emails in a short time. Please wait a few minutes and try again — your account details were not lost.";
  }
  if (m.includes("already registered") || m.includes("already been registered")) {
    return "An account already exists for that email address. Try logging in, or reset your password.";
  }
  if (m.includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }
  if (m.includes("email not confirmed")) {
    return "Please confirm your email address first — check your inbox for the confirmation link.";
  }
  if (m.includes("password")) {
    return message;
  }
  return message;
}

export type AuthActionState = { error: string | null; emailConfirmationSent?: boolean };

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = emailSchema.safeParse(formData.get("email"));
  const password = passwordSchema.safeParse(formData.get("password"));
  const fullName = String(formData.get("fullName") ?? "");
  const ageConfirmed = formData.get("ageConfirmed") === "on";

  if (!email.success) return { error: "Enter a valid email address." };
  if (!password.success) return { error: password.error.issues[0]?.message ?? "Invalid password." };
  if (!ageConfirmed) return { error: "You must confirm you are at least 18 years old to create an account." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: email.data,
    password: password.data,
    options: {
      data: { full_name: fullName, age_confirmed: true },
      // Must land on the callback, not straight on /dashboard: the link
      // carries a ?code= that has to be exchanged for a session first.
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard`,
    },
  });

  if (error) return { error: friendlyAuthError(error.message) };

  // With "Confirm email" enabled, signUp returns no session — the user is
  // not logged in yet and must follow the emailed link. Redirecting to
  // /dashboard here would just bounce them to /login with no explanation.
  if (!data.session) return { error: null, emailConfirmationSent: true };

  redirect("/dashboard");
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = emailSchema.safeParse(formData.get("email"));
  const password = formData.get("password");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!email.success) return { error: "Enter a valid email address." };
  if (!password || typeof password !== "string") return { error: "Enter your password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.data,
    password,
  });

  if (error) return { error: "Incorrect email or password." };

  // Bootstrap: an address in ADMIN_EMAILS becomes an admin on sign-in, so
  // the first admin does not require hand-editing the database. Never
  // demotes, and the promotion is written to the audit log.
  const { data: authed } = await supabase.auth.getUser();
  if (authed.user) await syncAdminFromAllowlist(authed.user.id, authed.user.email);

  revalidatePath("/", "layout");
  redirect(next);
}

export async function loginWithMagicLinkAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = emailSchema.safeParse(formData.get("email"));
  if (!email.success) return { error: "Enter a valid email address." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard` },
  });

  if (error) return { error: friendlyAuthError(error.message) };
  return { error: null };
}

export async function requestPasswordResetAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = emailSchema.safeParse(formData.get("email"));
  if (!email.success) return { error: "Enter a valid email address." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/login/reset-password`,
  });

  if (error) return { error: friendlyAuthError(error.message) };
  return { error: null };
}

export async function updatePasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const password = passwordSchema.safeParse(formData.get("password"));
  if (!password.success) return { error: password.error.issues[0]?.message ?? "Invalid password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: password.data });

  if (error) return { error: friendlyAuthError(error.message) };
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
