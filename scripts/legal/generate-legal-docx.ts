import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  PageBreak,
  AlignmentType,
  BorderStyle,
} from "docx";
import { writeFileSync } from "fs";
import { PRIVACY_BLOCKS } from "../../src/app/privacy/page";
import { TERMS_BLOCKS } from "../../src/app/terms/page";
import { REFUND_BLOCKS } from "../../src/app/refund-policy/page";
import { COOKIE_BLOCKS } from "../../src/app/cookie-policy/page";
import type { LegalBlock } from "../../src/components/marketing/LegalContent";

const PAGE = { width: 12240, height: 15840 }; // US Letter, DXA

function h1(text: string) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 240, after: 160 } });
}
function h2(text: string) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 120 } });
}
function h3(text: string) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 160, after: 80 } });
}
function body(text: string) {
  return new Paragraph({ children: [new TextRun(text)], spacing: { after: 160 }, alignment: AlignmentType.LEFT });
}
function bullet(text: string) {
  return new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 80 } });
}
function hr() {
  return new Paragraph({
    text: "",
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "999999" } },
    spacing: { after: 200 },
  });
}
function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function renderBlocksExpanded(blocks: LegalBlock[]): Paragraph[] {
  const out: Paragraph[] = [];
  for (const b of blocks) {
    if (b.kind === "h2") out.push(h2(b.text));
    else if (b.kind === "h3") out.push(h3(b.text));
    else if (b.kind === "ul") out.push(...b.items.map((item) => bullet(item)));
    else out.push(body(b.text));
  }
  return out;
}

const cover = [
  new Paragraph({ text: "EvalOtter — Legal Review Package (v2)", heading: HeadingLevel.TITLE, spacing: { after: 120 } }),
  body("Prepared for outside counsel review prior to public launch."),
  body(
    "EvalOtter is a web application (Next.js / Supabase / Stripe) offering paid, self-guided psychometric-style assessments. Users create an account, answer questions, and unlock a scored report via a one-time Stripe payment (no subscriptions). One assessment (\"Palmistry\") asks users to upload photographs of their own palms for AI-based image analysis. This package supersedes v1: we have now drafted a fuller document set (Privacy Policy, Terms of Use, Refund Policy, Cookie Policy) and implemented in-app consent notices (Palmistry consent, an 18+ age gate at signup, an assessment disclaimer gate, an immediate-performance/withdrawal-rights checkout consent, a public-sharing confirmation, and a cookie banner). All of this is drafted internally, not by counsel, and needs review before launch. The document text below is generated directly from the same source files that drive the live site, so it always matches what is actually published."
  ),
  hr(),
  h1("Two specific legal questions raised since v1"),
  bullet(
    "EU/EEA digital-content vs. digital-service characterisation: European Commission guidance discusses a court decision involving an online dating service and a personality report generated from a personality test, where the report was not simply treated as ordinary downloadable \"digital content.\" We have NOT assumed that our checkout consent checkbox (\"I request immediate supply... and acknowledge this may affect my withdrawal right\") resolves EU/EEA withdrawal-right requirements on its own. Please determine whether each EvalOtter purchase (a personalised, partly AI-generated report) is legally digital content, a digital service, or a mixed service, and whether our checkout consent flow is adequate for each characterisation."
  ),
  bullet(
    "Australian health-service characterisation: Australian guidance describes \"health service\" broadly enough to include activities that assess a person's physical or psychological health, and private-sector health-service providers can fall under the Privacy Act regardless of the normal small-business exemption thresholds. We have NOT assumed that an \"entertainment purposes only\" disclaimer resolves this on its own. Please determine, per assessment (particularly the cognitive/psychological ones — Palmistry is comparatively clearly entertainment-only), whether it constitutes a health service under Australian law, and what follows if so."
  ),
  hr(),
  h1("What we need from you"),
  body("Please review the full document set below and specifically address:"),
  bullet(
    "Data retention: our draft states palm photos are retained until the user deletes them (no auto-deletion is currently implemented) — please confirm whether that is acceptable or whether an auto-deletion schedule should be built and mandated instead."
  ),
  bullet(
    "Named sub-processors: the Privacy Policy names Supabase (database/auth/storage), Stripe (payments), and Anthropic (AI interpretation of scores) — please confirm this is sufficient and whether links to their DPA/privacy terms should be added."
  ),
  bullet("GDPR / CCPA (and any other applicable regional) rights language — please confirm adequacy of the drafted process (contact-based request handling)."),
  bullet(
    "Cookie / tracking disclosure: a Cookie Policy and cookie banner are now drafted (essential cookies only today; the consent gate is already in place for when analytics is added). Please confirm this structure is adequate."
  ),
  bullet(
    "Children's privacy: our draft states we do not knowingly collect data from children and that account creation requires an 18+ confirmation, enforced both client-side and server-side at signup — please confirm sufficiency."
  ),
  bullet(
    "Biometric / sensitive data handling for Palmistry: please confirm our drafted position (palm photos are not used for identification/authentication/matching, and we commit to additional consent/retention/deletion protections if processing legally constitutes biometric or special-category data) is adequate, especially under BIPA-style and GDPR special-category regimes."
  ),
  bullet(
    "Refund Policy: now a standalone page (full text below) rather than folded into Terms — please confirm the carve-outs and region-specific withdrawal-rights language are adequate."
  ),
  bullet(
    "Clinical/health disclaimers: please confirm the drafted \"no diagnosis / no high-impact decisions\" language (Terms §3-5) is sufficient, particularly given the Australian health-service question above."
  ),
  bullet("Governing law: drafted as Victoria, Australia (Terms §31) — please confirm this is the entity's actual intended jurisdiction and that the dispute-resolution/jurisdiction language is adequate."),
  bullet("IP / user-generated content: please confirm the scope and revocability of the public-sharing licence (Terms §12) is adequate."),
  bullet(
    "Limitation of liability cap: Terms §28(b) currently reads \"an amount to be confirmed with counsel\" — please provide the minimum figure/formula counsel is comfortable with."
  ),
  body("Everything below this point is generated from the live site's own source files, organized by page, followed by the in-app consent notice copy."),
];

const privacyIntro = [pageBreak(), h1("1. Privacy Policy — live page (/privacy)")];
const termsIntro = [pageBreak(), h1("2. Terms of Use — live page (/terms)")];
const refundIntro = [pageBreak(), h1("3. Refund Policy — live page (/refund-policy)")];
const cookieIntro = [pageBreak(), h1("4. Cookie Policy — live page (/cookie-policy)")];

const consentIntro = [pageBreak(), h1("5. In-app consent notices")];
const consentNotices: [string, string[]][] = [
  [
    "A. Palmistry consent (shown before palm photo upload)",
    [
      "Your Palmistry Photos",
      "Palmistry is provided for entertainment and self-reflection only and is not scientifically validated. To create your reading, EvalOtter will process photographs of your palms using automated and AI-assisted systems. EvalOtter does not use these photographs to identify you, authenticate you, match you against another person or create a biometric identity database. Your photographs will be handled according to our Privacy Policy and our Palmistry retention schedule. You must upload photographs of your own hands and must be at least 18 years old.",
      "[checkbox] I consent to EvalOtter processing my palm photographs to generate my Palmistry reading.",
    ],
  ],
  [
    "B. Immediate digital-service consent (shown before checkout payment)",
    [
      "Immediate access",
      "Your assessment/report will begin processing immediately after payment.",
      "[checkbox] I request immediate supply of my purchased digital assessment and report. Where applicable law provides a cancellation or withdrawal period, I expressly request that performance begins immediately and acknowledge that beginning or completing performance may affect or end that right where permitted by law.",
      "This acknowledgement does not affect any consumer rights that cannot legally be waived.",
    ],
  ],
  [
    "D. Assessment disclaimer (shown before starting a psychological/cognitive assessment, not shown for Palmistry which has its own consent above)",
    [
      "Important",
      "This assessment is provided for education, information and self-reflection. It is not a medical or psychological diagnosis and should not be used to determine whether you have a medical, psychiatric, neurological or developmental condition. Do not use EvalOtter results to make decisions about employment, healthcare, insurance, education, credit or another person's legal rights. If you are concerned about your physical or psychological health, consult an appropriately qualified healthcare professional.",
      "[checkbox] I understand the nature and limitations of this assessment.",
    ],
  ],
  [
    "E. AI interpretation notice (shown alongside AI-generated report content)",
    [
      "Parts of this report are generated using artificial intelligence. AI-generated interpretations can contain errors or unexpected conclusions and should not be treated as medical advice or objective statements of fact. Your underlying assessment score is calculated separately from this explanation and is never altered by it.",
    ],
  ],
  [
    "F. Age gate (shown at signup)",
    ["[checkbox, required to submit] I confirm that I am at least 18 years old."],
  ],
  [
    "G. Public-sharing confirmation (shown before enabling public sharing of a result)",
    [
      "Make this result public?",
      "Your results are private unless you choose to share them. If you continue, anyone who receives your public link may be able to view the information you choose to publish. You can disable sharing later, although third parties or search engines may retain copies of information that was public.",
      "[button] Share result / Cancel",
    ],
  ],
  [
    "H. Cookie banner (shown on first visit; reopenable via \"Manage cookie preferences\" in the footer)",
    [
      "Your privacy choices",
      "We use essential technologies to keep EvalOtter secure, remember your session and provide features you request. With your permission, we may also use analytics technologies to understand how the service is used. Optional tracking remains disabled where consent is legally required until you choose to enable it.",
      "[button] Accept optional cookies / Reject optional cookies",
    ],
  ],
];

const consentBlocks: Paragraph[] = [];
for (const [title, lines] of consentNotices) {
  consentBlocks.push(h2(title));
  for (const line of lines) consentBlocks.push(body(line));
}

const doc = new Document({
  sections: [
    {
      properties: { page: { size: PAGE, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
      children: [
        ...cover,
        ...privacyIntro,
        ...renderBlocksExpanded(PRIVACY_BLOCKS),
        ...termsIntro,
        ...renderBlocksExpanded(TERMS_BLOCKS),
        ...refundIntro,
        ...renderBlocksExpanded(REFUND_BLOCKS),
        ...cookieIntro,
        ...renderBlocksExpanded(COOKIE_BLOCKS),
        ...consentIntro,
        ...consentBlocks,
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  writeFileSync(process.argv[2] ?? "EvalOtter-Legal-Review-Package.docx", buf);
  console.log("done");
});
