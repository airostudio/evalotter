import type { Metadata } from "next";
import { SimplePageHeader } from "@/components/marketing/SimplePageHeader";
import { LegalContent, type LegalBlock } from "@/components/marketing/LegalContent";
import {
  BUSINESS_NUMBER,
  GOVERNING_LAW,
  LAST_UPDATED_PRIVACY,
  LEGAL_ADDRESS,
  LEGAL_ENTITY_NAME,
  PRIVACY_EMAIL,
  SUPPORT_EMAIL,
  WEBSITE_URL,
} from "@/config/legal";

export const metadata: Metadata = { title: "Privacy" };

export const PRIVACY_BLOCKS: LegalBlock[] = [
  { kind: "p", text: `Last updated: ${LAST_UPDATED_PRIVACY}` },

  { kind: "h2", text: "1. About this Privacy Policy" },
  {
    kind: "p",
    text: "EvalOtter provides online, self-guided assessments, scoring, reports and related digital services.",
  },
  {
    kind: "p",
    text: `This Privacy Policy explains how ${LEGAL_ENTITY_NAME}, trading as EvalOtter ("EvalOtter", "we", "us" or "our"), collects, uses, stores, discloses and protects personal information when you use EvalOtter websites, applications, assessments and related services.`,
  },
  {
    kind: "p",
    text: "Our intention is to apply strong privacy protections to users worldwide. Depending on where you live, additional rights may apply under local privacy and data-protection laws.",
  },
  {
    kind: "p",
    text: "Nothing in this Privacy Policy limits any privacy right that cannot lawfully be limited under the laws applicable to you.",
  },
  { kind: "p", text: `Privacy contact: ${PRIVACY_EMAIL}` },
  { kind: "p", text: `Registered address: ${LEGAL_ADDRESS}` },

  { kind: "h2", text: "2. Who controls your information" },
  {
    kind: "p",
    text: `Unless otherwise stated, ${LEGAL_ENTITY_NAME} is the controller, business, organisation or equivalent entity responsible for determining how personal information collected through EvalOtter is processed.`,
  },
  {
    kind: "p",
    text: "Some service providers may process information on our behalf, while others may act as independent controllers for particular activities.",
  },

  { kind: "h2", text: "3. Who may use EvalOtter" },
  { kind: "p", text: "EvalOtter is intended for adults." },
  {
    kind: "p",
    text: "You must be 18 years of age or older to create an account, purchase an assessment, upload images or otherwise use services requiring an account.",
  },
  { kind: "p", text: "We do not knowingly collect personal information from children." },
  {
    kind: "p",
    text: "If we discover that personal information has been collected from a child contrary to applicable law, we will take reasonable steps to delete it.",
  },
  {
    kind: "p",
    text: `A parent or guardian who believes a child has supplied personal information to EvalOtter should contact us at ${PRIVACY_EMAIL}.`,
  },

  { kind: "h2", text: "4. Information we collect" },
  { kind: "p", text: "Depending on how you use EvalOtter, we may collect the following categories of information." },
  { kind: "h3", text: "Account information" },
  { kind: "p", text: "This may include:" },
  {
    kind: "ul",
    items: [
      "name;",
      "email address;",
      "account identifier;",
      "login and authentication information;",
      "account preferences;",
      "country or region;",
      "age confirmation; and",
      "communications with us.",
    ],
  },
  { kind: "p", text: "We do not intentionally store your account password in readable form." },
  { kind: "h3", text: "Assessment information" },
  { kind: "p", text: "When you complete an assessment, we may collect:" },
  {
    kind: "ul",
    items: [
      "answers and selections;",
      "assessment completion information;",
      "numerical scores;",
      "categories, rankings or classifications;",
      "generated assessment results;",
      "written interpretations;",
      "assessment history; and",
      "information that you voluntarily provide as part of an assessment.",
    ],
  },
  {
    kind: "p",
    text: "Some assessment information may reveal or permit inferences concerning personal characteristics, abilities, preferences, behaviour, cognition, emotions or psychological characteristics.",
  },
  {
    kind: "p",
    text: "Depending on your jurisdiction and the nature of a particular assessment, this information may receive additional protection as sensitive, health-related or otherwise specially protected information.",
  },
  {
    kind: "p",
    text: "We apply this Privacy Policy to assessment information regardless of whether local law formally categorises it as sensitive information.",
  },

  { kind: "h2", text: "5. Palmistry photographs" },
  {
    kind: "p",
    text: "If you choose to use the Palmistry assessment, you may upload photographs of your own palms or hands.",
  },
  {
    kind: "p",
    text: "Palmistry photographs are processed solely to provide the Palmistry feature and related report.",
  },
  { kind: "p", text: "EvalOtter does not intend to use palm photographs to:" },
  {
    kind: "ul",
    items: [
      "identify you;",
      "verify your identity;",
      "authenticate access to your account;",
      "match you against another person;",
      "create a biometric identity database;",
      "conduct law-enforcement identification;",
      "build fingerprint identification records; or",
      "determine whether a palm belongs to a previously identified person.",
    ],
  },
  { kind: "p", text: "We do not claim that Palmistry is scientifically validated." },
  { kind: "p", text: "Palmistry is provided solely for entertainment and self-reflection." },
  {
    kind: "p",
    text: "Where required by law, we will request specific consent before processing palm or similar sensitive imagery.",
  },
  {
    kind: "p",
    text: "You must only upload images of your own hands unless EvalOtter expressly provides another lawful process for third-party images.",
  },
  { kind: "p", text: "You must not upload palm photographs of a child." },

  { kind: "h2", text: "6. Biometric information" },
  { kind: "p", text: "A photograph is not necessarily biometric information merely because it depicts a body part." },
  {
    kind: "p",
    text: "However, some jurisdictions regulate measurements, templates, geometry or other information extracted from human physical characteristics.",
  },
  { kind: "p", text: "EvalOtter's Palmistry feature is not designed for biometric identification or authentication." },
  {
    kind: "p",
    text: "Where technical processing could legally constitute processing of biometric or similarly protected information, we will apply additional consent, retention, disclosure and deletion protections required by applicable law.",
  },
  { kind: "p", text: "We do not sell biometric identifiers or biometric templates." },

  { kind: "h2", text: "7. Payment information" },
  { kind: "p", text: "Payments are processed through Stripe." },
  { kind: "p", text: "EvalOtter does not normally receive or store your complete payment-card number." },
  { kind: "p", text: "We may receive transaction information such as:" },
  {
    kind: "ul",
    items: [
      "payment status;",
      "transaction identifier;",
      "amount;",
      "currency;",
      "date;",
      "billing country;",
      "limited card information such as card type or last digits; and",
      "refund or dispute information.",
    ],
  },
  {
    kind: "p",
    text: "Stripe processes payment information under its own terms and privacy practices and may act as either a service provider/processor or an independent controller depending upon the processing involved.",
  },

  { kind: "h2", text: "8. Technical information" },
  {
    kind: "p",
    text: "When you use EvalOtter, we and our infrastructure providers may automatically receive technical information including:",
  },
  {
    kind: "ul",
    items: [
      "IP address;",
      "browser type;",
      "operating system;",
      "device information;",
      "session identifiers;",
      "login records;",
      "request logs;",
      "timestamps;",
      "security information;",
      "referring URLs;",
      "pages or features accessed; and",
      "cookie or similar identifiers.",
    ],
  },
  {
    kind: "p",
    text: "We use this information for service operation, security, fraud prevention, performance and, where permitted, analytics.",
  },

  { kind: "h2", text: "9. Cookies and similar technologies" },
  { kind: "p", text: "EvalOtter may use cookies, local storage and similar technologies." },
  { kind: "h3", text: "Essential technologies" },
  { kind: "p", text: "These may be required for:" },
  {
    kind: "ul",
    items: [
      "authentication;",
      "account security;",
      "remembering session state;",
      "load balancing;",
      "fraud prevention;",
      "payment processing; and",
      "providing services requested by you.",
    ],
  },
  {
    kind: "p",
    text: "Where permitted by law, essential technologies may operate without optional consent because they are necessary to provide the requested service.",
  },
  { kind: "h3", text: "Analytics and optional technologies" },
  {
    kind: "p",
    text: "Where analytics, advertising or other non-essential technologies require consent under applicable law, they will not be activated until the required consent has been obtained.",
  },
  {
    kind: "p",
    text: "Where available, you may withdraw or modify cookie consent through our cookie-preference controls.",
  },
  {
    kind: "p",
    text: "We do not intentionally permit advertising trackers to collect assessment answers, private assessment reports or Palmistry photographs.",
  },

  { kind: "h2", text: "10. How we use personal information" },
  { kind: "p", text: "We may process personal information to:" },
  {
    kind: "ul",
    items: [
      "create and administer accounts;",
      "authenticate users;",
      "provide assessments;",
      "calculate assessment scores;",
      "generate reports;",
      "provide AI-assisted interpretations;",
      "process purchases;",
      "provide purchased digital content;",
      "deliver third-party components included in a purchased bundle;",
      "provide customer support;",
      "maintain user assessment history;",
      "enable voluntary public sharing;",
      "prevent fraud and abuse;",
      "investigate security incidents;",
      "maintain and improve the service;",
      "comply with legal obligations;",
      "enforce our Terms;",
      "resolve payment disputes;",
      "protect users, EvalOtter and third parties; and",
      "establish, exercise or defend legal claims.",
    ],
  },
  {
    kind: "p",
    text: "We will not materially expand the use of sensitive assessment information or palm images for an incompatible new purpose without providing any notice or consent required by applicable law.",
  },

  { kind: "h2", text: "11. Legal bases for processing" },
  {
    kind: "p",
    text: "Where laws such as the EU GDPR or UK GDPR require us to identify a legal basis, our processing may rely on one or more of the following:",
  },
  { kind: "h3", text: "Contract" },
  {
    kind: "p",
    text: "Processing necessary to create your account, provide assessments, generate purchased reports and supply services you request.",
  },
  { kind: "h3", text: "Consent" },
  {
    kind: "p",
    text: "Processing based on your affirmative consent where consent is required, including certain sensitive-data, Palmistry, cookie or marketing activities.",
  },
  { kind: "p", text: "You may withdraw consent prospectively at any time where processing is based on consent." },
  { kind: "h3", text: "Legitimate interests" },
  { kind: "p", text: "Processing necessary for legitimate interests such as:" },
  {
    kind: "ul",
    items: [
      "service security;",
      "fraud prevention;",
      "service improvement;",
      "maintaining platform functionality;",
      "preventing misuse;",
      "protecting legal rights; and",
      "understanding general service performance,",
    ],
  },
  { kind: "p", text: "provided those interests are not overridden by applicable rights." },
  { kind: "h3", text: "Legal obligations" },
  {
    kind: "p",
    text: "Processing required for taxation, accounting, consumer law, regulatory compliance, legal proceedings and lawful government requests.",
  },
  { kind: "h3", text: "Legal claims and other permitted grounds" },
  { kind: "p", text: "Sensitive information may also be processed where another lawful exception or legal basis applies." },

  { kind: "h2", text: "12. AI processing" },
  { kind: "p", text: "Certain EvalOtter features use artificial intelligence." },
  {
    kind: "p",
    text: "Where AI interpretation is enabled, assessment information may be provided to our AI service provider for the purpose of generating a written interpretation.",
  },
  { kind: "p", text: "Our current primary AI provider is:" },
  { kind: "p", text: "Anthropic, PBC — AI inference and report interpretation." },
  { kind: "p", text: "Depending on the feature, information sent to the AI service may include:" },
  {
    kind: "ul",
    items: [
      "assessment type;",
      "assessment responses where required;",
      "computed scores;",
      "categories or classifications;",
      "instructions required to generate the report; and",
      "other information needed for that particular analysis.",
    ],
  },
  { kind: "p", text: "We seek to minimise direct account identifiers supplied to AI providers where they are not necessary." },
  { kind: "p", text: "We do not provide payment-card information to Anthropic for report generation." },
  { kind: "p", text: "AI-generated content can contain mistakes, unexpected conclusions or inaccurate statements." },
  {
    kind: "p",
    text: "AI output does not alter your underlying assessment score unless the particular assessment expressly states otherwise.",
  },

  { kind: "h2", text: "13. Service providers and recipients" },
  { kind: "p", text: "We use third parties to operate EvalOtter." },
  { kind: "p", text: "Current material providers include:" },
  { kind: "h3", text: "Supabase" },
  { kind: "p", text: "Used for database infrastructure, authentication, backend functionality and private file storage." },
  { kind: "p", text: "Privacy information: Supabase's published privacy documentation." },
  { kind: "h3", text: "Stripe" },
  { kind: "p", text: "Used for payment processing, fraud prevention, transaction administration and refunds." },
  { kind: "p", text: "Privacy information: Stripe's published privacy documentation." },
  { kind: "h3", text: "Anthropic" },
  { kind: "p", text: "Used for AI processing and generation of certain written interpretations." },
  { kind: "p", text: "Privacy information: Anthropic's published privacy and commercial data-processing documentation." },
  {
    kind: "p",
    text: "We may also disclose information to professional advisers, insurers, auditors, regulators, courts, law enforcement or other parties where legally necessary.",
  },
  {
    kind: "p",
    text: "If we appoint additional material providers, we may update this Privacy Policy or our service-provider list.",
  },

  { kind: "h2", text: "14. Third-party fulfilment" },
  {
    kind: "p",
    text: "Some EvalOtter bundles may include a product or service supplied separately by another provider, including products marketed under the Perfect Love name.",
  },
  {
    kind: "p",
    text: "Where third-party fulfilment requires personal information to be transferred to another provider, we will disclose this before or at the time of purchase where required.",
  },
  {
    kind: "p",
    text: "Information shared will be limited to what is reasonably necessary to provide the purchased product or service.",
  },
  { kind: "p", text: "The relevant provider may have its own privacy terms where it acts independently from EvalOtter." },

  { kind: "h2", text: "15. Public sharing" },
  { kind: "p", text: "Assessment results are private by default unless expressly stated otherwise." },
  { kind: "p", text: "If EvalOtter provides public-sharing functionality, sharing is opt-in." },
  {
    kind: "p",
    text: "When you enable public sharing, information you select may become accessible to anyone with access to the relevant public page or link.",
  },
  { kind: "p", text: "You may disable public sharing through the available controls." },
  {
    kind: "p",
    text: "Search engines and independent third parties may retain copies of information that was previously publicly available and may operate outside EvalOtter's control.",
  },

  { kind: "h2", text: "16. Selling or sharing personal information" },
  { kind: "p", text: "EvalOtter does not sell assessment responses or Palmistry photographs for monetary consideration." },
  {
    kind: "p",
    text: "If activities conducted by EvalOtter are legally characterised as a \"sale\", \"sharing\", targeted advertising or similar regulated disclosure in a particular jurisdiction, we will provide any opt-out mechanism required under applicable law.",
  },
  {
    kind: "p",
    text: "Where legally required, we will recognise supported opt-out preference signals such as Global Privacy Control.",
  },

  { kind: "h2", text: "17. Data retention" },
  {
    kind: "p",
    text: "We retain personal information only for as long as reasonably required for the purposes described in this Privacy Policy, unless a longer period is required or permitted by law.",
  },
  { kind: "p", text: "Our intended baseline retention schedule is:" },
  { kind: "h3", text: "Palmistry source photographs" },
  {
    kind: "p",
    text: "Retained until you delete them from your account or delete your account entirely. EvalOtter does not currently auto-delete palm photographs after analysis.",
  },
  { kind: "h3", text: "Assessment responses and reports" },
  { kind: "p", text: "Retained while your account remains active unless you delete an assessment earlier." },
  {
    kind: "p",
    text: "Following a valid deletion request or account deletion, production copies will generally be deleted or de-identified within 30 days, subject to legal exceptions.",
  },
  { kind: "h3", text: "Account information" },
  {
    kind: "p",
    text: "Retained for the duration of your account and generally deleted or de-identified within 30 days following account deletion, except where continued retention is legally required.",
  },
  { kind: "h3", text: "Backups" },
  {
    kind: "p",
    text: "Deleted data may remain temporarily in encrypted or access-restricted backups and will generally expire through normal backup rotation within 90 days.",
  },
  {
    kind: "p",
    text: "We do not normally restore deleted user data from backups except where necessary for disaster recovery, security or legal compliance.",
  },
  { kind: "h3", text: "Payment and accounting records" },
  {
    kind: "p",
    text: "Transaction records may be retained for up to 7 years, or longer where required under applicable tax, accounting, anti-fraud or consumer laws.",
  },
  { kind: "h3", text: "Security logs" },
  {
    kind: "p",
    text: "Security and technical logs may generally be retained for up to 12 months, subject to longer retention where necessary to investigate an incident or protect legal rights.",
  },
  { kind: "h3", text: "Legal disputes" },
  {
    kind: "p",
    text: "Relevant information may be retained for longer where reasonably required to establish, exercise or defend legal claims.",
  },

  { kind: "h2", text: "18. Deletion" },
  { kind: "p", text: "You may be able to delete:" },
  { kind: "ul", items: ["individual assessments;", "uploaded images;", "shared results; and", "your entire account."] },
  { kind: "p", text: "Deletion from the active application may occur before information expires from backups." },
  {
    kind: "p",
    text: "Deletion rights may be limited where we are legally required to retain particular information, including financial records, fraud records, legal-hold information or information necessary to establish or defend legal claims.",
  },
  {
    kind: "p",
    text: "Where we cannot delete information following a valid request, we will explain the applicable reason where required by law.",
  },

  { kind: "h2", text: "19. International transfers" },
  { kind: "p", text: "EvalOtter operates using global internet and cloud infrastructure." },
  { kind: "p", text: "Your information may therefore be processed in countries other than the country in which you live." },
  { kind: "p", text: "These countries may have privacy laws different from those in your home jurisdiction." },
  {
    kind: "p",
    text: "Where required, we use appropriate contractual, organisational or legal safeguards for international transfers, which may include:",
  },
  {
    kind: "ul",
    items: [
      "adequacy decisions;",
      "Standard Contractual Clauses;",
      "the UK International Data Transfer Addendum or equivalent mechanisms;",
      "contractual processor obligations; or",
      "another transfer mechanism recognised by applicable law.",
    ],
  },

  { kind: "h2", text: "20. Security" },
  { kind: "p", text: "We use technical and organisational safeguards designed to protect personal information." },
  { kind: "p", text: "Depending on the system, these may include:" },
  {
    kind: "ul",
    items: [
      "encryption in transit;",
      "encryption at rest where supported;",
      "authentication;",
      "private storage;",
      "access controls;",
      "Row Level Security;",
      "signed or restricted file access;",
      "administrative access restrictions;",
      "monitoring and logging;",
      "backup protections; and",
      "separation of privileged credentials.",
    ],
  },
  { kind: "p", text: "No internet-connected service can guarantee absolute security." },
  { kind: "p", text: "Users are responsible for maintaining the confidentiality of their account credentials." },

  { kind: "h2", text: "21. Data breaches" },
  {
    kind: "p",
    text: "If a security incident results in unauthorised access, disclosure, alteration or loss of personal information, we will investigate and take appropriate remedial action.",
  },
  {
    kind: "p",
    text: "Where legally required, we will notify affected individuals and/or relevant regulators within applicable statutory timeframes.",
  },

  { kind: "h2", text: "22. Your privacy rights" },
  { kind: "p", text: "Privacy rights vary by jurisdiction." },
  { kind: "p", text: "Subject to applicable law, you may have rights to:" },
  {
    kind: "ul",
    items: [
      "know whether we process your information;",
      "access personal information;",
      "receive a copy of personal information;",
      "correct inaccurate or incomplete information;",
      "delete information;",
      "withdraw consent;",
      "restrict certain processing;",
      "object to processing;",
      "receive portable information in a usable format;",
      "opt out of certain sales, sharing or targeted advertising;",
      "opt out of direct marketing;",
      "challenge or obtain information concerning certain automated decisions;",
      "lodge a complaint with a privacy regulator; and",
      "not be discriminated against for exercising privacy rights.",
    ],
  },
  { kind: "p", text: "These rights are not absolute and legal exemptions may apply." },

  { kind: "h2", text: "23. How to exercise your rights" },
  { kind: "p", text: `Requests may be submitted to: ${PRIVACY_EMAIL}` },
  { kind: "p", text: "Please describe the right you wish to exercise." },
  { kind: "p", text: "We may take reasonable steps to verify your identity before completing a request." },
  {
    kind: "p",
    text: "Where applicable, an authorised agent may make a request on your behalf, subject to appropriate verification.",
  },
  { kind: "p", text: "We will respond within the timeframe required by applicable law." },
  {
    kind: "p",
    text: "We will not charge a fee unless permitted by law, including where a request is manifestly unfounded, excessive or repetitive.",
  },

  { kind: "h2", text: "24. European Economic Area" },
  {
    kind: "p",
    text: "If the EU GDPR applies to you, you may have rights including access, rectification, erasure, restriction, portability, objection and withdrawal of consent.",
  },
  {
    kind: "p",
    text: "You may also complain to the data-protection supervisory authority in the EEA country in which you live, work or believe an infringement occurred.",
  },
  {
    kind: "p",
    text: "Where required, EvalOtter will appoint an EU representative and publish that representative's details here. EU Representative: not currently appointed — to be determined with counsel based on EU user volume.",
  },

  { kind: "h2", text: "25. United Kingdom" },
  { kind: "p", text: "Where UK data-protection law applies, you may exercise applicable UK GDPR rights." },
  { kind: "p", text: "You may lodge a complaint with the UK Information Commissioner's Office." },
  {
    kind: "p",
    text: "Where legally required, our UK representative details will appear here. UK Representative: not currently appointed — to be determined with counsel based on UK user volume.",
  },

  { kind: "h2", text: "26. Australia" },
  { kind: "p", text: "Australian users may have rights under the Privacy Act 1988 and Australian Privacy Principles." },
  {
    kind: "p",
    text: "Certain EvalOtter information could potentially constitute health information or sensitive information depending upon the nature of the assessment and the purpose for which information is processed.",
  },
  {
    kind: "p",
    text: "Nothing in this Privacy Policy limits rights available under Australian privacy, health-record or consumer law.",
  },
  { kind: "p", text: "You may lodge eligible privacy complaints with the Office of the Australian Information Commissioner." },
  { kind: "p", text: "Additional state or territory health-record legislation may apply in some circumstances." },

  { kind: "h2", text: "27. California and other United States privacy laws" },
  {
    kind: "p",
    text: "Residents of California and certain other US states may have additional rights where applicable legislation applies to EvalOtter.",
  },
  { kind: "p", text: "Depending on applicable law, these may include rights to:" },
  {
    kind: "ul",
    items: [
      "know what personal information is collected;",
      "access personal information;",
      "correct information;",
      "delete information;",
      "obtain information about categories of recipients;",
      "opt out of sale or sharing;",
      "opt out of targeted advertising;",
      "limit certain uses of sensitive personal information;",
      "appeal certain privacy-request decisions; and",
      "receive equal treatment when exercising privacy rights.",
    ],
  },
  { kind: "p", text: "EvalOtter does not discriminate against users for exercising legally protected privacy rights." },
  { kind: "p", text: "Where required, relevant opt-out controls will be made available." },

  { kind: "h2", text: "28. Canada" },
  {
    kind: "p",
    text: "Where Canadian privacy legislation applies, we process personal information in accordance with applicable federal or provincial privacy obligations.",
  },
  {
    kind: "p",
    text: "You may request access to or correction of personal information and may withdraw consent where processing lawfully depends on consent, subject to legal limitations.",
  },

  { kind: "h2", text: "29. Brazil" },
  {
    kind: "p",
    text: "Where Brazil's Lei Geral de Proteção de Dados Pessoais (LGPD) applies, users may exercise applicable rights concerning confirmation of processing, access, correction, anonymisation, blocking, deletion, portability, consent and information concerning data sharing, subject to the LGPD.",
  },
  { kind: "p", text: "Details of any locally required data-protection contact or representative will be provided where applicable." },

  { kind: "h2", text: "30. Other jurisdictions" },
  { kind: "p", text: "Users in other countries may have additional statutory privacy rights." },
  { kind: "p", text: "We intend to honour all rights required by laws that legally apply to EvalOtter." },
  {
    kind: "p",
    text: "Where local law gives you greater protection than this Privacy Policy, the mandatory requirements of that local law will prevail.",
  },

  { kind: "h2", text: "31. Automated processing" },
  { kind: "p", text: "EvalOtter uses automated systems to:" },
  {
    kind: "ul",
    items: [
      "calculate assessment scores;",
      "classify assessment outcomes;",
      "analyse inputs;",
      "generate reports; and",
      "generate AI-assisted narrative interpretations.",
    ],
  },
  { kind: "p", text: "These systems are not intended to make legally binding decisions concerning:" },
  {
    kind: "ul",
    items: [
      "employment;",
      "credit;",
      "insurance;",
      "education admission;",
      "housing;",
      "medical treatment;",
      "legal status; or",
      "access to essential services.",
    ],
  },
  { kind: "p", text: "EvalOtter assessments should not be used for those purposes." },

  { kind: "h2", text: "32. Changes to this Privacy Policy" },
  { kind: "p", text: "We may update this Privacy Policy as EvalOtter changes or legal requirements evolve." },
  { kind: "p", text: "The \"Last updated\" date will identify the current version." },
  { kind: "p", text: "Where required by law, we will provide additional notice before material changes take effect." },

  { kind: "h2", text: "33. Contact" },
  { kind: "p", text: "Questions, requests and complaints concerning privacy may be sent to:" },
  { kind: "p", text: "EvalOtter Privacy" },
  { kind: "p", text: LEGAL_ENTITY_NAME },
  { kind: "p", text: LEGAL_ADDRESS },
  { kind: "p", text: `Email: ${PRIVACY_EMAIL}` },
  { kind: "p", text: `Website: ${WEBSITE_URL}` },
  { kind: "p", text: `(Business/registration number: ${BUSINESS_NUMBER}; governed with reference to the laws of ${GOVERNING_LAW} — see Terms of Use.)` },
];

export default function PrivacyPage() {
  return (
    <div>
      <SimplePageHeader eyebrow="Privacy" title="Your data, your control" />
      <LegalContent blocks={PRIVACY_BLOCKS} />
    </div>
  );
}
