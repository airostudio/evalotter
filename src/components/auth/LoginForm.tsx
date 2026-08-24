"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthActionState } from "@/actions/auth";

const initialState: AuthActionState = { error: null };

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Field label="Password" name="password" type="password" autoComplete="current-password" required />

      {state.error && <p className="text-sm text-red-300">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="focus-ring mt-2 flex min-h-[48px] items-center justify-center rounded-xl2 bg-signal-violet text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Signing in…" : "Log in"}
      </button>

      <div className="flex items-center justify-between text-xs text-paper-100/50">
        <Link href="/forgot-password" className="focus-ring hover:text-paper-100">
          Forgot password?
        </Link>
        <Link href="/signup" className="focus-ring hover:text-paper-100">
          Create an account
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
  required,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-paper-100/70">
      {label}
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="focus-ring rounded-xl2 border border-ink-600 bg-ink-800/60 px-4 py-3 text-[15px] text-paper-100 placeholder:text-paper-100/30"
      />
    </label>
  );
}
