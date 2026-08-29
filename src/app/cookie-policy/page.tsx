import type { Metadata } from "next";
import { SimplePageHeader } from "@/components/marketing/SimplePageHeader";
import { LegalContent, type LegalBlock } from "@/components/marketing/LegalContent";
import { LAST_UPDATED_PRIVACY, PRIVACY_EMAIL } from "@/config/legal";

export const metadata: Metadata = { title: "Cookie Policy" };

export const COOKIE_BLOCKS: LegalBlock[] = [
  { kind: "p", text: `Last updated: ${LAST_UPDATED_PRIVACY}` },
  { kind: "p", text: "EvalOtter uses cookies, local storage and similar technologies on this website." },

  { kind: "h2", text: "Essential technologies" },
  {
    kind: "p",
    text: "These are required for the service to function and cannot be switched off. Today this means the authentication and session cookies set by our login provider (Supabase), which keep you signed in and keep your account secure, plus a small local-storage entry that remembers your cookie preference itself.",
  },
  { kind: "p", text: "Essential technologies operate without asking for optional consent, because they are necessary to provide the service you've requested." },

  { kind: "h2", text: "Analytics and optional technologies" },
  {
    kind: "p",
    text: "EvalOtter does not currently set any analytics, advertising or other non-essential cookies. If we add any in future, they will not be activated until you have given the consent our cookie banner requests, and you will be able to change your choice at any time from the banner's \"Manage Preferences\" control.",
  },
  {
    kind: "p",
    text: "We do not permit advertising trackers to collect assessment answers, private assessment reports, or Palmistry photographs.",
  },

  { kind: "h2", text: "Your choices" },
  {
    kind: "p",
    text: "You can accept or reject optional cookies from the banner shown on your first visit, and revisit that choice at any time using the \"Manage cookie preferences\" link in the site footer. Rejecting optional cookies does not affect your ability to use EvalOtter.",
  },
  { kind: "p", text: `Questions about this policy can be sent to ${PRIVACY_EMAIL}.` },
];

export default function CookiePolicyPage() {
  return (
    <div>
      <SimplePageHeader eyebrow="Cookies" title="Cookie Policy" />
      <LegalContent blocks={COOKIE_BLOCKS} />
    </div>
  );
}
