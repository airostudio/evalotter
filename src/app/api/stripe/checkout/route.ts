import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/client";
import { PRICING } from "@/lib/stripe/pricing";

type CheckoutType = "single" | "collection" | "collection_plus_love";

/**
 * Creates a Stripe Checkout Session for one of three purchase types:
 *  - "single": unlocks one assessment's results ($1.99). Takes either an
 *    `attemptId` (from a just-completed results page) or an `assessmentId`
 *    (from the pricing page, buying ahead of taking it) — either resolves
 *    to the same assessment-level entitlement (see `hasReportAccess`).
 *  - "collection": unlocks every assessment's results, forever ($18.99).
 *  - "collection_plus_love": the same, plus Perfect Love (perfectlove.site)
 *    access ($39.99) — see README "Monetization" for the fulfillment caveat.
 * Prices are passed inline via `price_data`, so nothing needs to be
 * pre-created in the Stripe Dashboard beyond the API keys themselves.
 */
export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: "Payments are not configured yet. Set STRIPE_SECRET_KEY to enable checkout." },
      { status: 503 }
    );
  }

  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const type = body?.type as CheckoutType | undefined;
  const attemptId = body?.attemptId as string | undefined;
  const assessmentIdInput = body?.assessmentId as string | undefined;

  if (type !== "single" && type !== "collection" && type !== "collection_plus_love") {
    return NextResponse.json({ error: "Invalid checkout type" }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;

  if (type === "single") {
    if (!attemptId && !assessmentIdInput) {
      return NextResponse.json(
        { error: "attemptId or assessmentId is required for a single-report unlock" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    let assessmentId: string;
    let title: string;
    let resultId: string | null = null;
    let returnPath: string;

    if (attemptId) {
      const { data: attempt } = await supabase
        .from("assessment_attempts")
        .select("id, assessment_id, assessments(title)")
        .eq("id", attemptId)
        .eq("user_id", user.id)
        .single();

      if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

      const { data: result } = await supabase
        .from("assessment_results")
        .select("id")
        .eq("attempt_id", attemptId)
        .eq("user_id", user.id)
        .maybeSingle();

      assessmentId = attempt.assessment_id;
      title = (attempt.assessments as { title?: string } | null)?.title ?? "your assessment";
      resultId = result?.id ?? null;
      returnPath = `/results/${attemptId}`;
    } else {
      const { data: assessment } = await supabase
        .from("assessments")
        .select("id, slug, title")
        .eq("id", assessmentIdInput!)
        .single();

      if (!assessment) return NextResponse.json({ error: "Assessment not found" }, { status: 404 });

      assessmentId = assessment.id;
      title = assessment.title;
      returnPath = `/assessments/${assessment.slug}`;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: PRICING.singleReport.amountCents,
            product_data: {
              name: `${title} — full report unlock`,
              description:
                "Unlocks your complete results for this assessment: dimension breakdown, AI interpretation, and downloadable report.",
            },
          },
        },
      ],
      metadata: {
        userId: user.id,
        type: "single",
        assessmentId,
        resultId: resultId ?? "",
      },
      success_url: `${siteUrl}${returnPath}?checkout_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}${returnPath}`,
    });

    return NextResponse.json({ url: session.url });
  }

  // "collection" or "collection_plus_love"
  const pricing = type === "collection_plus_love" ? PRICING.collectionPlusLove : PRICING.fullCollection;
  const returnPath = attemptId ? `/results/${attemptId}` : "/dashboard";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email ?? undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: pricing.amountCents,
          product_data: {
            name:
              type === "collection_plus_love"
                ? "EvalOtter full collection + Perfect Love — lifetime unlock"
                : "EvalOtter full collection — lifetime unlock",
            description:
              type === "collection_plus_love"
                ? "Unlocks complete results for every EvalOtter assessment, forever, plus access to Perfect Love (perfectlove.site)."
                : "Unlocks complete results for every assessment on EvalOtter, forever, including everything you take from now on.",
          },
        },
      },
    ],
    metadata: {
      userId: user.id,
      type,
    },
    success_url: `${siteUrl}${returnPath}?checkout_session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}${returnPath}`,
  });

  return NextResponse.json({ url: session.url });
}
