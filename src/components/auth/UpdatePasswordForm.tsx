"use client";

import { useActionState } from "react";
import { updatePasswordAction, type AuthActionState } from "@/actions/auth";

const initialState: AuthActionState = { error: null };

export function UpdatePasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePasswordAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm text-paper-100/70">
        New password
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="focus-ring rounded-xl2 border border-ink-600 bg-ink-800/60 px-4 py-3 text-[15px] text-paper-100"
        />
      </label>

      {state.error && <p className="text-sm text-red-300">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="focus-ring mt-2 flex min-h-[48px] items-center justify-center rounded-xl2 bg-signal-violet text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
