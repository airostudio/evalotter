import Link from "next/link";
import type { Metadata } from "next";
import { getOverview, getRecentAttempts } from "@/lib/admin/queries";
import { Badge, Empty, Panel, Stat, Table, Td, dateTime, money, pct } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [o, recent] = await Promise.all([getOverview(), getRecentAttempts(15)]);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Users" value={o.totalUsers.toLocaleString()} sub={`${o.newUsers30d} new in 30 days`} />
        <Stat
          label="Revenue"
          value={money(o.revenueCents)}
          sub={`${money(o.revenue30dCents)} in 30 days`}
        />
        <Stat
          label="Paying users"
          value={o.payingUsers.toLocaleString()}
          sub={`${pct(o.conversionRate)} of all users`}
        />
        <Stat
          label="Assessments taken"
          value={o.totalAttempts.toLocaleString()}
          sub={`${o.completedAttempts} completed · ${pct(o.completionRate)}`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="AI interpretations" value={o.aiInterpretations.toLocaleString()} />
        <Stat label="Palmistry submissions" value={o.palmistrySubmissions.toLocaleString()} />
        <Stat label="Publicly shared results" value={o.publicShares.toLocaleString()} />
        <Stat
          label="Avg revenue / paying user"
          value={o.payingUsers > 0 ? money(Math.round(o.revenueCents / o.payingUsers)) : "—"}
        />
      </div>

      <Panel
        title="Recent activity"
        action={
          <Link href="/admin/activity" className="focus-ring rounded text-xs text-signal-cyan hover:underline">
            View all
          </Link>
        }
      >
        {recent.length === 0 ? (
          <Empty>No assessment attempts yet.</Empty>
        ) : (
          <Table head={["Assessment", "Status", "Progress", "Started", "User"]}>
            {recent.map((a) => (
              <tr key={a.id}>
                <Td>{(a.assessments as { title?: string } | null)?.title ?? "—"}</Td>
                <Td>
                  <Badge value={a.status} />
                </Td>
                <Td>{Math.round(Number(a.progress_percent))}%</Td>
                <Td className="whitespace-nowrap">{dateTime(a.started_at)}</Td>
                <Td>
                  <Link
                    href={`/admin/users/${a.user_id}`}
                    className="focus-ring rounded font-mono text-xs text-signal-cyan hover:underline"
                  >
                    {a.user_id.slice(0, 8)}…
                  </Link>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>
    </div>
  );
}
