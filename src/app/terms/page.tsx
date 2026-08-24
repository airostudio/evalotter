import type { Metadata } from "next";
import { SimplePageHeader } from "@/components/marketing/SimplePageHeader";

export const metadata: Metadata = { title: "Terms" };

const SECTIONS = [
  {
    title: "Nature of the service",
    body: "EvalOtter assessments are designed for education, entertainment and self-discovery and are not a substitute for professional psychological, medical or clinical assessment. Palmistry specifically is offered for entertainment and self-reflection only, and carries no scientific validity claim.",
  },
  {
    title: "Your account",
    body: "You're responsible for keeping your login credentials secure and for the accuracy of information you provide. You may delete your account at any time.",
  },
  {
    title: "Acceptable use",
    body: "Don't attempt to circumvent scoring, automate assessment completion, or use the platform to harass or impersonate others.",
  },
  {
    title: "Content you provide",
    body: "Responses, uploaded images, and shared results remain yours. By sharing a result publicly you grant us permission to display it as you've configured, until you revoke sharing.",
  },
  {
    title: "Changes",
    body: "We may update these terms as the platform evolves; material changes will be communicated in advance where practical.",
  },
];

export default function TermsPage() {
  return (
    <div>
      <SimplePageHeader eyebrow="Terms" title="Terms of use" />
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-10">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="font-display text-xl text-paper-100">{s.title}</h2>
              <p className="mt-2 leading-relaxed text-paper-100/60">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
