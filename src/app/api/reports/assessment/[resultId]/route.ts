import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/current-user";
import { generateAssessmentReportPdf } from "@/lib/reports/generate-assessment-report";

export async function GET(_req: Request, { params }: { params: Promise<{ resultId: string }> }) {
  const { resultId } = await params;
  const user = await requireUser();
  const supabase = await createClient();

  const { data: result, error } = await supabase
    .from("assessment_results")
    .select("*, assessments(title), result_ranges:overall_range_id(title)")
    .eq("id", resultId)
    .eq("user_id", user.id)
    .single();

  if (error || !result) {
    return NextResponse.json({ error: "Result not found" }, { status: 404 });
  }

  const { data: dimensionRows } = await supabase
    .from("result_dimensions")
    .select("*")
    .eq("result_id", resultId);

  const pdfBytes = await generateAssessmentReportPdf({
    user: { displayName: user.profile?.displayName ?? null, fullName: user.profile?.fullName ?? null },
    assessment: { title: result.assessments?.title ?? "Assessment" },
    completedAt: result.created_at,
    overallScore: Number(result.overall_score),
    overallRangeTitle: result.result_ranges?.title ?? null,
    dimensions: (dimensionRows ?? []).map((d) => ({
      dimensionKey: d.dimension_key,
      label: d.label,
      rawScore: Number(d.raw_score),
      score: Number(d.score),
      percentile: d.percentile ? Number(d.percentile) : null,
    })),
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="brainyak-report-${resultId}.pdf"`,
    },
  });
}
