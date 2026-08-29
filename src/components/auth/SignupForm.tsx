"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction, type AuthActionState } from "@/actions/auth";

const initialState: AuthActionState = { error: null };

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm text-paper-100/70">
        Full name
        <input
          name="fullName"
          type="text"
          autoComplete="name"
          className="focus-ring rounded-xl2 border border-ink-600 bg-ink-800/60 px-4 py-3 text-[15px] text-paper-100"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-paper-100/70">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="focus-ring rounded-xl2 border border-ink-600 bg-ink-800/60 px-4 py-3 text-[15px] text-paper-100"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-paper-100/70">
        Password
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="focus-ring rounded-xl2 border border-ink-600 bg-ink-800/60 px-4 py-3 text-[15px] text-paper-100"
        />
      </label>

      <label className="flex items-start gap-3 text-left text-xs text-paper-100/70">
        <input
          name="ageConfirmed"
          type="checkbox"
          required
          className="mt-0.5 h-4 w-4 rounded border-ink-500 bg-ink-800 accent-signal-cyan"
        />
        I confirm that I am at least 18 years old.
      </label>

      {state.error && <p className="text-sm text-red-300">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="focus-ring mt-2 flex min-h-[48px] items-center justify-center rounded-xl2 bg-signal-violet text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-xs text-paper-100/50">
        Already have an account?{" "}
        <Link href="/login" className="focus-ring text-paper-100 hover:text-signal-cyan">
          Log in
        </Link>
      </p>
    </form>
  );
}
