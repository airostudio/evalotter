import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/current-user";

export async function GET() {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: profile }, { data: dims }] = await Promise.all([
    supabase.from("user_brain_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("brain_profile_dimensions")
      .select("*")
      .eq("user_id", user.id)
      .not("score", "is", null)
      .order("score", { ascending: false }),
  ]);

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);

  const INK = rgb(0.04, 0.05, 0.08);
  const VIOLET = rgb(0.486, 0.361, 1);
  const MUTED = rgb(0.45, 0.46, 0.5);

  let y = height - 64;
  page.drawText("BRAINYAK", { x: 48, y, size: 12, font: bold, color: VIOLET });
  page.drawText("Complete Brain Profile Report", { x: 48, y: y - 16, size: 10, font: regular, color: MUTED });

  y -= 56;
  const name = user.profile?.displayName ?? user.profile?.fullName ?? user.email ?? "Brainyak user";
  page.drawText(name, { x: 48, y, size: 22, font: bold, color: INK });

  y -= 44;
  page.drawText("Brainyak Score", { x: 48, y, size: 10, font: regular, color: MUTED });
  y -= 30;
  page.drawText(profile?.brainyak_score ? `${Math.round(Number(profile.brainyak_score))} / 100` : "Not yet available", {
    x: 48,
    y,
    size: 28,
    font: bold,
    color: INK,
  });

  y -= 30;
  page.drawText(`${profile?.assessments_completed ?? 0} / ${profile?.assessments_total ?? 10} assessments completed`, {
    x: 48,
    y,
    size: 10,
    font: regular,
    color: MUTED,
  });

  y -= 48;
  page.drawLine({ start: { x: 48, y }, end: { x: width - 48, y }, thickness: 1, color: rgb(0.9, 0.9, 0.92) });

  y -= 28;
  page.drawText("Dimension scores", { x: 48, y, size: 12, font: bold, color: INK });
  y -= 22;

  for (const dim of dims ?? []) {
    if (y < 80) break;
    page.drawText(dim.label, { x: 48, y, size: 10, font: regular, color: INK });
    const barX = 260;
    const barWidth = 220;
    page.drawRectangle({ x: barX, y: y - 4, width: barWidth, height: 8, color: rgb(0.93, 0.93, 0.95) });
    page.drawRectangle({
      x: barX,
      y: y - 4,
      width: (barWidth * Math.min(100, Math.max(0, Number(dim.score)))) / 100,
      height: 8,
      color: VIOLET,
    });
    page.drawText(String(Math.round(Number(dim.score))), { x: barX + barWidth + 12, y, size: 10, font: bold, color: INK });
    y -= 24;
  }

  page.drawText(
    "Brainyak assessments are designed for education, entertainment and self-discovery and are not a substitute for professional psychological, medical or clinical assessment.",
    { x: 48, y: 48, size: 7.5, font: regular, color: MUTED, maxWidth: width - 96, lineHeight: 10 }
  );

  const bytes = await pdf.save();

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="brainyak-brain-profile.pdf"`,
    },
  });
}
