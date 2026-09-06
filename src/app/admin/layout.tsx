import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";

/**
 * Gate for the whole /admin subtree. The middleware already redirects
 * non-admins, but everything under here reads through the service-role
 * client (which bypasses RLS), so the check is repeated at the layout —
 * middleware alone is not an authorization boundary worth betting user data
 * on, and a layout runs for every nested route including ones added later.
 */
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  const role = user.profile?.role;
  if (role !== "admin" && role !== "super_admin") redirect("/dashboard");
  return user;
}

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/financials", label: "Financials" },
  { href: "/admin/assessments", label: "Assessments" },
  { href: "/admin/activity", label: "Activity" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-xs uppercase tracking-widest text-signal-cyan/80">Admin</span>
          <h1 className="mt-1 font-display text-3xl text-paper-100">Control room</h1>
        </div>
        <p className="text-xs text-paper-100/40">
          Signed in as {user.email} · {user.profile?.role}
        </p>
      </div>

      <nav className="mt-6 flex flex-wrap gap-1 border-b border-ink-700 pb-px" aria-label="Admin sections">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="focus-ring rounded-t-lg px-4 py-2.5 text-sm text-paper-100/60 hover:bg-ink-800/60 hover:text-paper-100"
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8">{children}</div>
    </div>
  );
}
