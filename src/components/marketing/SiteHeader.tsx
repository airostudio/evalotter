import Link from "next/link";
import type { AuthedUser } from "@/lib/auth/current-user";
import { logoutAction } from "@/actions/auth";
import { BrandMark, BrandWordmark } from "./BrandMark";

const NAV_LINKS = [
  { href: "/assessments", label: "Assessments" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/methodology", label: "Methodology" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader({ user }: { user: AuthedUser | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-700/80 bg-ink-950/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 focus-ring rounded-lg">
          <BrandMark size={20} />
          <BrandWordmark className="text-lg" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="focus-ring rounded text-sm text-paper-100/70 transition-colors hover:text-paper-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="focus-ring hidden rounded-xl2 border border-ink-600 px-4 py-2 text-sm text-paper-100/85 transition-colors hover:border-ink-500 sm:inline-flex"
              >
                Dashboard
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="focus-ring rounded-xl2 px-3 py-2 text-sm text-paper-100/60 hover:text-paper-100"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="focus-ring hidden rounded-xl2 px-4 py-2 text-sm text-paper-100/70 hover:text-paper-100 sm:inline-flex"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="focus-ring inline-flex min-h-[40px] items-center rounded-xl2 bg-signal-violet px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
