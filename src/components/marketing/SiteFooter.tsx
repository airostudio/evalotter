import Link from "next/link";
import { Brain } from "lucide-react";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { href: "/assessments", label: "Assessments" },
      { href: "/brain-profile", label: "Brain Profile" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/methodology", label: "Methodology" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-700/80 bg-ink-900/60">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-signal-cyan" />
              <span className="font-display text-lg text-paper-100">Brainyak</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-paper-100/50">
              Interactive assessments designed to reveal how you think.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-medium uppercase tracking-wider text-paper-100/40">
                {col.title}
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="focus-ring rounded text-sm text-paper-100/60 hover:text-paper-100"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-ink-700/80 pt-6">
          <p className="max-w-3xl text-xs leading-relaxed text-paper-100/40">
            Brainyak assessments are designed for education, entertainment and self-discovery and
            are not a substitute for professional psychological, medical or clinical assessment.
          </p>
          <p className="mt-3 text-xs text-paper-100/30">
            © {new Date().getFullYear()} Brainyak. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
