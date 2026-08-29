import type { Metadata } from "next";
import { SimplePageHeader } from "@/components/marketing/SimplePageHeader";
import { LegalContent, type LegalBlock } from "@/components/marketing/LegalContent";
import { LAST_UPDATED_TERMS, SUPPORT_EMAIL } from "@/config/legal";

export const metadata: Metadata = { title: "Refund Policy" };

export const REFUND_BLOCKS: LegalBlock[] = [
  { kind: "p", text: `Last updated: ${LAST_UPDATED_TERMS}` },
  {
    kind: "p",
    text: "EvalOtter products are generally personalised digital services delivered immediately after purchase.",
  },
  { kind: "p", text: "Once a personalised report has been generated or made available, purchases are generally non-refundable unless:" },
  {
    kind: "ul",
    items: [
      "required by applicable law;",
      "the product was not delivered;",
      "the service is materially defective;",
      "you were incorrectly charged; or",
      "another statutory remedy applies.",
    ],
  },
  {
    kind: "p",
    text: "Nothing in this policy excludes mandatory consumer guarantees, refund rights or cancellation rights available under the law of your country.",
  },
  { kind: "h2", text: "Region-specific withdrawal rights" },
  {
    kind: "p",
    text: "Consumers in the European Union, European Economic Area and United Kingdom may have statutory withdrawal rights for distance contracts involving digital content or digital services. Whether a given EvalOtter purchase (including a personalised, AI-assisted report) is legally digital content, a digital service, or a mixed service affects how those rights apply, and has not yet been finally determined by counsel. Where legally required, we ask for your express request and acknowledgement before beginning immediate performance — see the checkout consent notice — but that acknowledgement is not assumed on its own to waive a right that cannot be waived under applicable law.",
  },
  {
    kind: "p",
    text: "Australian consumers retain all guarantees, rights and remedies available under the Australian Consumer Law, which are not excluded, restricted or modified by this policy.",
  },
  { kind: "h2", text: "How to request a refund" },
  { kind: "p", text: `Email ${SUPPORT_EMAIL} with your account email, the assessment or product purchased, and the reason for your request. We will respond within a reasonable time and in line with any statutory timeframe that applies to you.` },
];

export default function RefundPolicyPage() {
  return (
    <div>
      <SimplePageHeader eyebrow="Refunds" title="Refund Policy" />
      <LegalContent blocks={REFUND_BLOCKS} />
    </div>
  );
}
