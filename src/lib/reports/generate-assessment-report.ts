import "server-only";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Assessment, DimensionScore, Profile } from "@/types";

export interface AssessmentReportInput {
  user: Pick<Profile, "displayName" | "fullName">;
  assessment: Pick<Assessment, "title">;
  completedAt: string;
  overallScore: number;
  overallRangeTitle?: string | null;
  dimensions: DimensionScore[];
  interpretationSummary?: string | null;
}

const INK = rgb(0.04, 0.05, 0.08);
const VIOLET = rgb(0.486, 0.361, 1);
const CYAN = rgb(0.361, 0.882, 0.902);
const MUTED = rgb(0.45, 0.46, 0.5);

/**
 * Generates a professionally formatted, single-assessment PDF report.
 * Deliberately built with pdf-lib (no headless-browser dependency) so it
 * runs reliably in a serverless Route Handler. The same primitives are
 * reused by the Complete Brain Profile Report generator.
 */
export async function generateAssessmentReportPdf(input: AssessmentReportInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);

  let y = height - 64;

  page.drawText("BRAINYAK", { x: 48, y, size: 12, font: bold, color: VIOLET });
  page.drawText("Assessment Report", { x: 48, y: y - 16, size: 10, font: regular, color: MUTED });

  y -= 56;
  page.drawText(input.assessment.title, { x: 48, y, size: 22, font: bold, color: INK });

  y -= 30;
  const name = input.user.displayName ?? input.user.fullName ?? "Brainyak user";
  page.drawText(`${name}  ·  ${new Date(input.completedAt).toLocaleDateString()}`, {
    x: 48,
    y,
    size: 10,
    font: regular,
    color: MUTED,
  });

  y -= 48;
  page.drawText("Overall score", { x: 48, y, size: 10, font: regular, color: MUTED });
  y -= 30;
  page.drawText(`${Math.round(input.overallScore)} / 100`, { x: 48, y, size: 32, font: bold, color: INK });
  if (input.overallRangeTitle) {
    page.drawText(input.overallRangeTitle, { x: 48, y: y - 20, size: 13, font: bold, color: CYAN });
  }

  y -= 56;
  page.drawLine({ start: { x: 48, y }, end: { x: width - 48, y }, thickness: 1, color: rgb(0.9, 0.9, 0.92) });

  y -= 28;
  page.drawText("Dimension scores", { x: 48, y, size: 12, font: bold, color: INK });
  y -= 22;

  for (const dim of input.dimensions) {
    if (y < 100) break;
    page.drawText(dim.label, { x: 48, y, size: 10, font: regular, color: INK });

    const barX = 260;
    const barWidth = 220;
    page.drawRectangle({ x: barX, y: y - 4, width: barWidth, height: 8, color: rgb(0.93, 0.93, 0.95) });
    page.drawRectangle({
      x: barX,
      y: y - 4,
      width: (barWidth * Math.min(100, Math.max(0, dim.score))) / 100,
      height: 8,
      color: VIOLET,
    });
    page.drawText(String(Math.round(dim.score)), { x: barX + barWidth + 12, y, size: 10, font: bold, color: INK });

    y -= 24;
  }

  if (input.interpretationSummary) {
    y -= 20;
    page.drawText("Interpretation", { x: 48, y, size: 12, font: bold, color: INK });
    y -= 18;
    const lines = wrapText(input.interpretationSummary, 90);
    for (const line of lines) {
      if (y < 90) break;
      page.drawText(line, { x: 48, y, size: 10, font: regular, color: rgb(0.25, 0.26, 0.3) });
      y -= 15;
    }
  }

  page.drawText(
    "Brainyak assessments are designed for education, entertainment and self-discovery and are not a substitute for professional psychological, medical or clinical assessment.",
    { x: 48, y: 48, size: 7.5, font: regular, color: MUTED, maxWidth: width - 96, lineHeight: 10 }
  );

  return pdf.save();
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxChars) {
      lines.push(current.trim());
      current = word;
    } else {
      current += " " + word;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}
