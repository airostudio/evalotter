import type { Metadata } from "next";
import { SimplePageHeader } from "@/components/marketing/SimplePageHeader";
import { LegalContent, type LegalBlock } from "@/components/marketing/LegalContent";
import {
  GOVERNING_LAW,
  LAST_UPDATED_TERMS,
  LEGAL_ADDRESS,
  LEGAL_ENTITY_NAME,
  SUPPORT_EMAIL,
  WEBSITE_URL,
} from "@/config/legal";

export const metadata: Metadata = { title: "Terms" };

export const TERMS_BLOCKS: LegalBlock[] = [
  { kind: "p", text: `Last updated: ${LAST_UPDATED_TERMS}` },
  { kind: "p", text: "These Terms govern your use of EvalOtter." },
  { kind: "p", text: "By creating an account, purchasing a product or using EvalOtter, you agree to these Terms." },
  {
    kind: "p",
    text: "If mandatory consumer law in your jurisdiction gives you rights that cannot legally be excluded or modified, those rights remain unaffected.",
  },

  { kind: "h2", text: "1. About EvalOtter" },
  { kind: "p", text: "EvalOtter is operated by:" },
  { kind: "p", text: LEGAL_ENTITY_NAME },
  { kind: "p", text: LEGAL_ADDRESS },
  { kind: "p", text: `Support: ${SUPPORT_EMAIL}` },
  {
    kind: "p",
    text: "EvalOtter provides self-guided digital assessments, scoring, reports, AI-assisted interpretations and related digital products.",
  },

  { kind: "h2", text: "2. Adults only" },
  {
    kind: "p",
    text: "You must be at least 18 years old to create an account, purchase an assessment or use restricted EvalOtter services.",
  },
  {
    kind: "p",
    text: "By using those services, you confirm that you meet this requirement and have legal capacity to enter into the transaction.",
  },

  { kind: "h2", text: "3. Nature of the service" },
  { kind: "p", text: "EvalOtter assessments are provided for:" },
  { kind: "ul", items: ["education;", "information;", "entertainment; and", "personal self-reflection."] },
  {
    kind: "p",
    text: "Unless expressly stated otherwise, EvalOtter assessments are not scientifically validated clinical instruments.",
  },
  { kind: "p", text: "EvalOtter is not a medical, psychological, psychiatric, neurological or healthcare provider." },
  { kind: "p", text: "EvalOtter does not provide medical or mental-health diagnosis or treatment." },
  { kind: "p", text: "Results are not a substitute for professional assessment by an appropriately qualified practitioner." },

  { kind: "h2", text: "4. No diagnosis" },
  {
    kind: "p",
    text: "You must not interpret an EvalOtter result as diagnosing or excluding any disease, disorder, disability, psychological condition, developmental condition or other medical condition.",
  },
  { kind: "p", text: "Results must not be relied upon to determine whether someone has conditions including, without limitation:" },
  {
    kind: "ul",
    items: [
      "depression;",
      "anxiety disorders;",
      "ADHD;",
      "autism;",
      "dementia;",
      "cognitive impairment;",
      "intellectual disability;",
      "personality disorders; or",
      "other medical, psychiatric or neurological conditions.",
    ],
  },
  {
    kind: "p",
    text: "If you have concerns about your physical or psychological health, obtain advice from an appropriately qualified healthcare professional.",
  },

  { kind: "h2", text: "5. No high-impact decisions" },
  { kind: "p", text: "EvalOtter assessments and reports are not designed or authorised for decisions concerning another person's:" },
  {
    kind: "ul",
    items: [
      "employment;",
      "recruitment;",
      "dismissal;",
      "promotion;",
      "credit;",
      "insurance;",
      "healthcare;",
      "education admission;",
      "housing;",
      "immigration;",
      "legal rights;",
      "criminal justice;",
      "financial eligibility; or",
      "access to essential services.",
    ],
  },
  {
    kind: "p",
    text: "Commercial or institutional use of EvalOtter results for these purposes is prohibited unless EvalOtter expressly provides a legally compliant product designed for that purpose.",
  },

  { kind: "h2", text: "6. Palmistry" },
  { kind: "p", text: "Palmistry is provided solely for entertainment and self-reflection." },
  { kind: "p", text: "EvalOtter does not represent that palm lines, hand shape or related characteristics can scientifically determine:" },
  {
    kind: "ul",
    items: [
      "personality;",
      "intelligence;",
      "compatibility;",
      "health;",
      "lifespan;",
      "future events;",
      "financial outcomes;",
      "relationships; or",
      "destiny.",
    ],
  },
  { kind: "p", text: "Palmistry outputs may be generated in part by artificial intelligence." },
  { kind: "p", text: "They should not be treated as factual predictions." },

  { kind: "h2", text: "7. Palm photographs" },
  { kind: "p", text: "You may only upload photographs that you are legally entitled to provide." },
  { kind: "p", text: "Unless expressly permitted by EvalOtter, Palmistry uploads must depict your own hands." },
  { kind: "p", text: "You must not upload images of children." },
  { kind: "p", text: "You must not upload images for the purpose of:" },
  {
    kind: "ul",
    items: [
      "identifying another person;",
      "investigating another person;",
      "biometric matching;",
      "impersonation;",
      "harassment;",
      "surveillance; or",
      "unlawful profiling.",
    ],
  },
  { kind: "p", text: "Additional consent may be required before Palmistry processing begins." },

  { kind: "h2", text: "8. AI-generated content" },
  { kind: "p", text: "Some EvalOtter reports contain content produced with artificial intelligence." },
  { kind: "p", text: "AI-generated content can:" },
  {
    kind: "ul",
    items: [
      "contain factual errors;",
      "misinterpret information;",
      "omit relevant context;",
      "generate unexpected statements; and",
      "produce different interpretations from similar inputs.",
    ],
  },
  {
    kind: "p",
    text: "EvalOtter does not guarantee that AI-generated interpretations are accurate, complete or suitable for a particular purpose.",
  },
  {
    kind: "p",
    text: "Underlying assessment scores and AI-generated interpretations should be distinguished from one another.",
  },

  { kind: "h2", text: "9. Your account" },
  { kind: "p", text: "You are responsible for:" },
  {
    kind: "ul",
    items: [
      "providing accurate account information;",
      "maintaining secure login credentials;",
      "restricting access to your account; and",
      "activities undertaken through your account where legally attributable to you.",
    ],
  },
  { kind: "p", text: "You must notify us promptly if you believe your account has been compromised." },
  { kind: "p", text: "You may delete your account through available account functionality or by contacting us." },

  { kind: "h2", text: "10. Acceptable use" },
  { kind: "p", text: "You must not:" },
  {
    kind: "ul",
    items: [
      "break applicable law;",
      "circumvent payment controls;",
      "interfere with scoring systems;",
      "automate assessments without permission;",
      "scrape protected user information;",
      "probe or attack platform security;",
      "upload malware;",
      "interfere with other users;",
      "impersonate another person;",
      "use another person's account without authority;",
      "harass or threaten another person;",
      "upload unlawful content;",
      "attempt unauthorised access;",
      "reverse engineer protected systems except where law expressly permits it;",
      "use EvalOtter to train a competing assessment service through systematic extraction;",
      "use assessment results for prohibited high-impact decisions; or",
      "use Palmistry for biometric identification.",
    ],
  },
  { kind: "p", text: "We may suspend access where reasonably necessary to protect users, security or legal compliance." },

  { kind: "h2", text: "11. Ownership of your content" },
  {
    kind: "p",
    text: "You retain ownership of content that you provide to EvalOtter, including assessment responses and uploaded images, to the extent that content is capable of ownership.",
  },
  {
    kind: "p",
    text: "You grant EvalOtter a limited, non-exclusive licence to host, process, reproduce and technically modify your content solely as reasonably required to operate the services you request.",
  },
  { kind: "p", text: "This licence ends when the relevant information is deleted, subject to reasonable backup, security and legal-retention periods." },

  { kind: "h2", text: "12. Public sharing" },
  { kind: "p", text: "Results are not made public solely because you complete an assessment." },
  { kind: "p", text: "If you voluntarily enable public sharing, you grant EvalOtter a:" },
  { kind: "ul", items: ["non-exclusive;", "worldwide;", "royalty-free; and", "revocable"] },
  {
    kind: "p",
    text: "licence to host, reproduce, format and publicly display the information you elected to share solely for the purpose of providing the sharing feature.",
  },
  { kind: "p", text: "The licence ends after you revoke public sharing, subject to reasonable technical processing and backup periods." },
  {
    kind: "p",
    text: "EvalOtter cannot guarantee deletion of copies independently stored, indexed or republished by third parties while the information was public.",
  },

  { kind: "h2", text: "13. EvalOtter intellectual property" },
  {
    kind: "p",
    text: "The EvalOtter platform, branding, original assessment content, scoring systems, software, interface, graphics and other proprietary material belong to EvalOtter or its licensors.",
  },
  {
    kind: "p",
    text: "Except as permitted by law or expressly authorised by EvalOtter, you may not reproduce, commercially exploit, resell or distribute substantial portions of the platform.",
  },

  { kind: "h2", text: "14. Payments" },
  { kind: "p", text: "Paid EvalOtter products are generally purchased through a one-time payment." },
  { kind: "p", text: "Unless clearly identified otherwise at checkout:" },
  { kind: "ul", items: ["there is no subscription;", "there is no recurring charge; and", "there is no automatic renewal."] },
  { kind: "p", text: "Payments are processed by Stripe or another payment provider identified at checkout." },
  { kind: "p", text: "You authorise the relevant payment provider to charge the displayed purchase amount." },

  { kind: "h2", text: "15. Prices and taxes" },
  { kind: "p", text: "Prices will be displayed before you complete your purchase." },
  { kind: "p", text: "Prices may vary by currency or region." },
  { kind: "p", text: "Applicable taxes may be added or included depending on local legal requirements." },

  { kind: "h2", text: "16. Immediate delivery" },
  {
    kind: "p",
    text: "Some EvalOtter products are digital services or content made available immediately after payment.",
  },
  {
    kind: "p",
    text: "By requesting immediate performance, you may affect cancellation or withdrawal rights available under certain consumer laws.",
  },
  {
    kind: "p",
    text: "Where legally required, we will separately ask you to expressly consent to immediate performance and acknowledge any statutory consequence before completing the transaction.",
  },

  { kind: "h2", text: "17. Refund policy" },
  {
    kind: "p",
    text: "Our refund policy is set out in full in our separate Refund Policy. In summary: once a personalised digital assessment or report has been generated or made available, the purchase is generally non-refundable except where required by law, the product was not supplied, the product is materially defective, you were charged incorrectly, an unauthorised transaction has been verified, or EvalOtter otherwise agrees to a refund.",
  },
  {
    kind: "p",
    text: "This policy does not exclude statutory consumer guarantees, cooling-off rights, withdrawal rights or remedies that cannot legally be excluded.",
  },
  { kind: "p", text: `Requests should be sent to ${SUPPORT_EMAIL}.` },

  { kind: "h2", text: "18. EU and EEA digital-service rights" },
  { kind: "p", text: "Consumers in the European Union or European Economic Area may have statutory withdrawal rights for distance contracts." },
  {
    kind: "p",
    text: "The precise treatment can depend upon whether an EvalOtter purchase is legally characterised as digital content, a digital service or another type of service — including whether a generated personality-style report is treated differently from ordinary downloadable digital content. This determination has not yet been made by counsel and a checkout consent checkbox alone should not be assumed to resolve it.",
  },
  {
    kind: "p",
    text: "Where required, EvalOtter will obtain an express request or consent before starting immediate performance and any legally required acknowledgement concerning the effect on withdrawal rights.",
  },
  { kind: "p", text: "Nothing in these Terms removes a mandatory EU consumer right." },

  { kind: "h2", text: "19. United Kingdom consumer rights" },
  { kind: "p", text: "UK consumers retain all mandatory protections provided under applicable UK consumer law." },
  {
    kind: "p",
    text: "Where immediate supply of digital content or services affects a statutory cancellation right, EvalOtter will seek any consent or acknowledgement required by applicable law.",
  },

  { kind: "h2", text: "20. Australian Consumer Law" },
  {
    kind: "p",
    text: "Nothing in these Terms excludes, restricts or modifies any guarantee, right or remedy under the Australian Consumer Law or another law where doing so would be unlawful.",
  },
  { kind: "p", text: "Where a statutory guarantee applies, you may be entitled to remedies that override our standard refund policy." },
  {
    kind: "p",
    text: "Whether any EvalOtter assessment constitutes a \"health service\" for the purposes of Australian privacy or health-records law (which can bring a provider within the Privacy Act regardless of ordinary small-business thresholds) has not been determined. An entertainment-only disclaimer is not assumed to resolve this question on its own — it is a specific item for counsel to determine per assessment.",
  },

  { kind: "h2", text: "21. Other consumer laws" },
  { kind: "p", text: "Users in other countries may have mandatory consumer rights concerning:" },
  {
    kind: "ul",
    items: [
      "quality;",
      "conformity;",
      "refunds;",
      "digital services;",
      "cancellation;",
      "unfair contract terms;",
      "warranties; or",
      "misleading representations.",
    ],
  },
  { kind: "p", text: "Those mandatory rights prevail over inconsistent provisions in these Terms." },

  { kind: "h2", text: "22. Chargebacks and payment disputes" },
  { kind: "p", text: "If you believe a payment is incorrect, please contact us first so that we can investigate." },
  { kind: "p", text: "Nothing in these Terms prevents you from exercising legitimate rights with your payment provider." },
  {
    kind: "p",
    text: "Fraudulent or knowingly false chargeback claims may result in account restrictions and may be contested using transaction and service-delivery records.",
  },

  { kind: "h2", text: "23. Third-party products" },
  { kind: "p", text: "Some purchases may contain products or services delivered by a third party." },
  {
    kind: "p",
    text: "For example, a bundle may include access to a product marketed as Perfect Love that is delivered separately.",
  },
  { kind: "p", text: "Where applicable, the checkout or product description will explain material fulfilment information." },
  { kind: "p", text: "Third-party services may be governed by additional terms." },
  { kind: "p", text: "Nothing in a third-party arrangement removes consumer rights for which EvalOtter remains legally responsible." },

  { kind: "h2", text: "24. Third-party services" },
  { kind: "p", text: "EvalOtter relies upon third parties including payment processors, hosting providers and AI providers." },
  {
    kind: "p",
    text: "We are not responsible for independent third-party services outside our reasonable control except where liability cannot legally be excluded.",
  },

  { kind: "h2", text: "25. Availability" },
  { kind: "p", text: "We aim to provide reliable access but do not guarantee uninterrupted operation." },
  { kind: "p", text: "Services may occasionally be unavailable because of:" },
  {
    kind: "ul",
    items: [
      "maintenance;",
      "security incidents;",
      "infrastructure outages;",
      "third-party failures;",
      "internet disruptions;",
      "software updates; or",
      "events outside our reasonable control.",
    ],
  },

  { kind: "h2", text: "26. No guarantee of assessment accuracy" },
  { kind: "p", text: "Assessments involve inherent limitations." },
  { kind: "p", text: "Scores and reports may be influenced by:" },
  {
    kind: "ul",
    items: [
      "interpretation of questions;",
      "incomplete information;",
      "response bias;",
      "environmental factors;",
      "user attention;",
      "assessment design;",
      "statistical limitations; and",
      "automated processing.",
    ],
  },
  {
    kind: "p",
    text: "We do not guarantee that an assessment result perfectly represents any aspect of your personality, intelligence, cognitive ability, emotional state or future behaviour.",
  },

  { kind: "h2", text: "27. Disclaimer of warranties" },
  { kind: "p", text: "To the maximum extent permitted by applicable law, EvalOtter is provided on an \"as available\" basis." },
  { kind: "p", text: "We do not warrant that:" },
  {
    kind: "ul",
    items: [
      "every feature will always be available;",
      "every assessment is scientifically validated;",
      "every AI output is accurate;",
      "every report is error-free; or",
      "a result will be suitable for a particular purpose.",
    ],
  },
  { kind: "p", text: "This section does not exclude warranties or guarantees that cannot legally be excluded." },

  { kind: "h2", text: "28. Limitation of liability" },
  {
    kind: "p",
    text: "To the maximum extent permitted by law, EvalOtter and its officers, employees and contractors will not be liable for indirect, incidental, special or consequential loss arising from use of the platform.",
  },
  {
    kind: "p",
    text: "Where liability may legally be limited, our aggregate liability relating to a particular paid service will not exceed the greater of: (a) the amount you paid EvalOtter for the service giving rise to the claim during the preceding 12 months; or (b) an amount to be confirmed with counsel.",
  },
  {
    kind: "p",
    text: "This limitation does not apply where liability cannot legally be excluded or limited, including where applicable law prohibits limitation for fraud, intentional misconduct, personal injury or mandatory consumer rights.",
  },

  { kind: "h2", text: "29. Indemnity" },
  {
    kind: "p",
    text: "To the extent permitted by applicable law, you agree to indemnify EvalOtter against reasonable losses arising directly from your unlawful use of the service, infringement of third-party rights or deliberate breach of these Terms.",
  },
  { kind: "p", text: "This clause does not apply to the extent that a loss was caused by EvalOtter." },

  { kind: "h2", text: "30. Suspension and termination" },
  { kind: "p", text: "We may restrict or suspend access where reasonably necessary because of:" },
  {
    kind: "ul",
    items: ["material breach of these Terms;", "fraud;", "security threats;", "unlawful activity;", "risks to other users; or", "legal requirements."],
  },
  { kind: "p", text: "Where reasonably practical and legally appropriate, we will provide notice." },
  { kind: "p", text: "You may stop using EvalOtter or delete your account at any time." },

  { kind: "h2", text: "31. Governing law" },
  { kind: "p", text: `Unless mandatory consumer law requires otherwise, these Terms are governed by the laws of ${GOVERNING_LAW}.` },
  {
    kind: "p",
    text: `Subject to mandatory consumer rights concerning jurisdiction, the courts of ${GOVERNING_LAW} and courts entitled to hear appeals from them have non-exclusive jurisdiction.`,
  },
  { kind: "p", text: "If the law where you live gives you a mandatory right to bring proceedings in your local courts, this section does not remove that right." },

  { kind: "h2", text: "32. Disputes" },
  { kind: "p", text: `Before starting formal proceedings, we encourage users to contact ${SUPPORT_EMAIL} and provide sufficient information for us to investigate the dispute.` },
  { kind: "p", text: "Nothing in this section prevents either party from seeking urgent injunctive relief or exercising a statutory right." },

  { kind: "h2", text: "33. Changes to the service" },
  { kind: "p", text: "We may add, change or discontinue features." },
  { kind: "p", text: "Material changes affecting purchased services will be managed in accordance with applicable consumer law." },

  { kind: "h2", text: "34. Changes to these Terms" },
  { kind: "p", text: "We may update these Terms where reasonably necessary because of:" },
  { kind: "ul", items: ["new functionality;", "legal requirements;", "security requirements;", "business changes; or", "clarification of existing provisions."] },
  { kind: "p", text: "Where required, we will provide reasonable advance notice of material changes." },
  { kind: "p", text: "Changes will not retrospectively remove rights that have already accrued unless legally permitted." },

  { kind: "h2", text: "35. Severability" },
  { kind: "p", text: "If part of these Terms is held invalid or unenforceable, the remaining provisions remain effective to the maximum extent permitted by law." },

  { kind: "h2", text: "36. Entire agreement" },
  {
    kind: "p",
    text: "These Terms, the Privacy Policy, our Refund Policy, our Cookie Policy and any additional terms displayed for a particular product constitute the agreement relating to your use of that product.",
  },
  { kind: "p", text: "Mandatory statutory rights remain unaffected." },

  { kind: "h2", text: "37. Contact" },
  { kind: "p", text: "EvalOtter" },
  { kind: "p", text: LEGAL_ENTITY_NAME },
  { kind: "p", text: LEGAL_ADDRESS },
  { kind: "p", text: `Email: ${SUPPORT_EMAIL}` },
  { kind: "p", text: `Website: ${WEBSITE_URL}` },
];

export default function TermsPage() {
  return (
    <div>
      <SimplePageHeader eyebrow="Terms" title="Terms of use" />
      <LegalContent blocks={TERMS_BLOCKS} />
    </div>
  );
}
