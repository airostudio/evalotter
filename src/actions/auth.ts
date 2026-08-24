"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.string().email();
const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

export type AuthActionState = { error: string | null };

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = emailSchema.safeParse(formData.get("email"));
  const password = passwordSchema.safeParse(formData.get("password"));
  const fullName = String(formData.get("fullName") ?? "");

  if (!email.success) return { error: "Enter a valid email address." };
  if (!password.success) return { error: password.error.issues[0]?.message ?? "Invalid password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: email.data,
    password: password.data,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    },
  });

  if (error) return { error: error.message };

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
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard` },
  });

  if (error) return { error: error.message };
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
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login/reset-password`,
  });

  if (error) return { error: error.message };
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

  if (error) return { error: error.message };
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
