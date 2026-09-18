import type { ReactNode } from "react";
import { Otter } from "@/components/brand/Otter";

export function money(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

export function date(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function dateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="rounded-xl2 border border-ink-700 bg-ink-800/40 p-5">
      <p className="text-xs uppercase tracking-wider text-paper-100/40">{label}</p>
      <p className="mt-2 font-display text-2xl text-paper-100">{value}</p>
      {sub && <p className="mt-1 text-xs text-paper-100/50">{sub}</p>}
    </div>
  );
}

export function Panel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-xl2 border border-ink-700 bg-ink-800/30">
      <header className="flex items-center justify-between border-b border-ink-700 px-5 py-3.5">
        <h2 className="text-sm font-medium text-paper-100">{title}</h2>
        {action}
      </header>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <table className="w-full min-w-[640px] text-left text-sm">
      <thead>
        <tr className="border-b border-ink-700 text-xs uppercase tracking-wider text-paper-100/40">
          {head.map((h) => (
            <th key={h} className="px-5 py-3 font-medium">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-ink-700/60">{children}</tbody>
    </table>
  );
}

export function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-5 py-3 text-paper-100/80 ${className}`}>{children}</td>;
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
      <Otter size={44} mood="sleepy" />
      <p className="max-w-sm text-sm leading-relaxed text-paper-100/50">{children}</p>
    </div>
  );
}

const BADGE: Record<string, string> = {
  completed: "border-green-500/40 bg-green-500/10 text-signal-green",
  in_progress: "border-amber-500/40 bg-amber-500/10 text-signal-amber",
  abandoned: "border-ink-600 bg-ink-800 text-paper-100/50",
  redeemed: "border-green-500/40 bg-green-500/10 text-signal-green",
  issued: "border-amber-500/40 bg-amber-500/10 text-signal-amber",
  published: "border-green-500/40 bg-green-500/10 text-signal-green",
  admin: "border-signal-blue/50 bg-signal-blue/15 text-signal-blue",
  super_admin: "border-signal-blue/50 bg-signal-blue/15 text-signal-blue",
};

export function Badge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs ${
        BADGE[value] ?? "border-ink-600 bg-ink-800 text-paper-100/60"
      }`}
    >
      {value.replace(/_/g, " ")}
    </span>
  );
}
