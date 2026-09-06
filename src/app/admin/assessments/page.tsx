import Link from "next/link";
import type { Metadata } from "next";
import { getAssessmentStats } from "@/lib/admin/queries";
import { Badge, Empty, Panel, Stat, Table, Td, money, pct } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Admin · Assessments" };
export const dynamic = "force-dynamic";

export default async function AdminAssessmentsPage() {
  const rows = await getAssessmentStats();
  const started = rows.reduce((s, r) => s + r.started, 0);
  const completed = rows.reduce((s, r) => s + r.completed, 0);
  const revenue = rows.reduce((s, r) => s + r.revenueCents, 0);
  const ranked = [...rows].sort((a, b) => b.started - a.started);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Assessments live" value={rows.length} />
        <Stat label="Total started" value={started.toLocaleString()} />
        <Stat
          label="Total completed"
          value={completed.toLocaleString()}
          sub={started > 0 ? `${pct(completed / started)} completion` : undefined}
        />
        <Stat label="Attributed revenue" value={money(revenue)} sub="single-report unlocks only" />
      </div>

      <Panel title="Per assessment (most taken first)">
        {ranked.length === 0 ? (
          <Empty>No assessments in the database — has the seed been run?</Empty>
        ) : (
          <Table head={["Assessment", "Status", "Access", "Started", "Completed", "Completion", "Avg score", "Revenue"]}>
            {ranked.map((r) => (
              <tr key={r.id}>
                <Td>
                  <Link
                    href={`/assessments/${r.slug}`}
                    className="focus-ring rounded text-paper-100 hover:text-signal-cyan"
                  >
                    {r.title}
                  </Link>
                </Td>
                <Td>
                  <Badge value={r.status} />
                </Td>
                <Td className="capitalize">{r.access}</Td>
                <Td>{r.started}</Td>
                <Td>{r.completed}</Td>
                <Td>{r.started > 0 ? pct(r.completionRate) : "—"}</Td>
                <Td className="font-display text-paper-100">
                  {r.avgScore === null ? "—" : Math.round(r.avgScore)}
                </Td>
                <Td>{r.revenueCents > 0 ? money(r.revenueCents) : "—"}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>
    </div>
  );
}
