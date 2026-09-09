import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAssessmentQuestionStats } from "@/lib/admin/queries";
import { Badge, Empty, Panel, Table, Td, pct } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Admin · Assessment" };
export const dynamic = "force-dynamic";

/**
 * Item analysis. A question everyone gets right, or nobody does, is not
 * measuring anything — that is the signal that catches a broken item before
 * a customer complains about it.
 */
export default async function AdminAssessmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getAssessmentQuestionStats(slug);
  if (!data) notFound();

  const { assessment, questions } = data;
  const answered = questions.filter((q) => q.answered > 0);
  const suspicious = answered.filter(
    (q) => q.scorable && q.correctRate !== null && (q.correctRate === 0 || q.correctRate === 1)
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin/assessments" className="focus-ring rounded text-xs text-signal-cyan hover:underline">
          ← All assessments
        </Link>
        <h2 className="mt-2 font-display text-2xl text-paper-100">{assessment.title}</h2>
        <p className="mt-1 flex flex-wrap gap-3 text-sm text-paper-100/50">
          <span className="font-mono text-xs">{assessment.slug}</span>
          <Badge value={assessment.status} />
          <span className="capitalize">{assessment.access}</span>
          <span className="capitalize">{assessment.difficulty}</span>
          <span>{questions.length} questions</span>
        </p>
      </div>

      {suspicious.length > 0 && (
        <Panel title={`${suspicious.length} item(s) worth checking`}>
          <p className="mb-3 text-sm text-paper-100/55">
            Answered by everyone the same way — either impossible or unmissable. Both mean the item
            is not discriminating between takers.
          </p>
          <Table head={["Key", "Question", "Correct rate", "Answers"]}>
            {suspicious.map((q) => (
              <tr key={q.id}>
                <Td className="font-mono text-xs">{q.key}</Td>
                <Td>{q.text.slice(0, 90)}</Td>
                <Td className="text-paper-100">{pct(q.correctRate ?? 0)}</Td>
                <Td>{q.answered}</Td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}

      <Panel title="Every question">
        {questions.length === 0 ? (
          <Empty>No questions linked to the published version.</Empty>
        ) : (
          <Table head={["Key", "Section", "Type", "Question", "Answers", "Correct", "Avg time"]}>
            {questions.map((q) => (
              <tr key={q.id}>
                <Td className="font-mono text-xs">{q.key}</Td>
                <Td className="text-xs">{q.section ?? "—"}</Td>
                <Td className="font-mono text-[11px]">{q.type}</Td>
                <Td>{q.text.slice(0, 80)}{q.text.length > 80 ? "…" : ""}</Td>
                <Td>{q.answered}</Td>
                <Td className="text-paper-100">
                  {!q.scorable ? <span className="text-paper-100/35">n/a</span>
                    : q.correctRate === null ? "—" : pct(q.correctRate)}
                </Td>
                <Td>{q.avgSeconds === null ? "—" : `${q.avgSeconds}s`}</Td>
              </tr>
            ))}
          </Table>
        )}
        <p className="mt-4 text-xs text-paper-100/35">
          &quot;n/a&quot; means the item has no single correct option — self-report and graded-response
          items are scored by points, not right/wrong, so a correct rate would be meaningless.
        </p>
      </Panel>
    </div>
  );
}
