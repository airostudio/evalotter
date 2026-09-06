import Link from "next/link";
import type { Metadata } from "next";
import { getRecentAttempts } from "@/lib/admin/queries";
import { Badge, Empty, Panel, Table, Td, dateTime } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Admin · Activity" };
export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  const attempts = await getRecentAttempts(200);

  return (
    <Panel title={`Last ${attempts.length} attempts`}>
      {attempts.length === 0 ? (
        <Empty>No assessment attempts yet.</Empty>
      ) : (
        <Table head={["Assessment", "Status", "Progress", "Started", "Completed", "User"]}>
          {attempts.map((a) => (
            <tr key={a.id}>
              <Td>{(a.assessments as { title?: string } | null)?.title ?? "—"}</Td>
              <Td>
                <Badge value={a.status} />
              </Td>
              <Td>{Math.round(Number(a.progress_percent))}%</Td>
              <Td className="whitespace-nowrap">{dateTime(a.started_at)}</Td>
              <Td className="whitespace-nowrap">{dateTime(a.completed_at)}</Td>
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
  );
}
