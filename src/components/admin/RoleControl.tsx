"use client";

import { useState, useTransition } from "react";
import { setUserRoleAction } from "@/actions/admin";

const ROLES = ["user", "editor", "admin", "super_admin"] as const;

/**
 * Changes a user's role. The action re-checks the caller server-side and
 * refuses to remove the last admin, so this control is a convenience over a
 * guarded operation rather than the guard itself.
 */
export function RoleControl({
  userId,
  currentRole,
  canGrantSuperAdmin,
}: {
  userId: string;
  currentRole: string;
  canGrantSuperAdmin: boolean;
}) {
  const [role, setRole] = useState(currentRole);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const options = ROLES.filter((r) => r !== "super_admin" || canGrantSuperAdmin || currentRole === "super_admin");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={role}
          disabled={pending}
          onChange={(e) => {
            setRole(e.target.value);
            setError(null);
            setDone(false);
          }}
          className="focus-ring rounded-xl2 border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-paper-100"
        >
          {options.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button
          type="button"
          disabled={pending || role === currentRole}
          onClick={() =>
            startTransition(async () => {
              try {
                await setUserRoleAction(userId, role);
                setDone(true);
                setError(null);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Could not change role");
                setRole(currentRole);
              }
            })
          }
          className="focus-ring rounded-xl2 border border-ink-600 px-4 py-2 text-sm text-paper-100 transition-colors hover:border-signal-cyan/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Saving…" : "Apply"}
        </button>
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
      {done && <p className="text-xs text-signal-cyan">Role updated and recorded in the audit log.</p>}
    </div>
  );
}
