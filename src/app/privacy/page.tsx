import type { Metadata } from "next";
import { SimplePageHeader } from "@/components/marketing/SimplePageHeader";

export const metadata: Metadata = { title: "Privacy" };

const SECTIONS = [
  {
    title: "What we collect",
    body: "Your account details (name, email), your responses to assessments, and — if you choose to take Palmistry — photographs of your palms. We never collect more than an assessment needs.",
  },
  {
    title: "Palm images",
    body: "Palmistry photos are stored in a private storage bucket accessible only to you and, where necessary, our infrastructure providers. They are never public by default. You can delete them at any time from your account.",
  },
  {
    title: "Your controls",
    body: "You can delete any uploaded image, delete individual assessment results, or delete your entire account and associated data. Sharing a result publicly is always opt-in and can be revoked at any time.",
  },
  {
    title: "AI processing",
    body: "Where AI interpretation is enabled, your already-computed scores (never raw personal identifiers beyond what's needed) are sent to the configured AI provider to generate a written interpretation. This never changes your underlying score.",
  },
  {
    title: "Data export",
    body: "You can request an export of your assessment history and results at any time by contacting us.",
  },
];

export default function PrivacyPage() {
  return (
    <div>
      <SimplePageHeader eyebrow="Privacy" title="Your data, your control" />
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
