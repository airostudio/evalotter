import type { Metadata } from "next";
import { getAuditLog } from "@/lib/admin/queries";
import { Empty, Panel, Table, Td, dateTime } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Admin · Audit" };
export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const rows = await getAuditLog(200);

  return (
    <Panel title={`Audit log — last ${rows.length} action${rows.length === 1 ? "" : "s"}`}>
      {rows.length === 0 ? (
        <Empty>No privileged actions recorded yet.</Empty>
      ) : (
        <Table head={["When", "Actor", "Action", "What happened"]}>
          {rows.map((r) => (
            <tr key={r.id}>
              <Td className="whitespace-nowrap">{dateTime(r.created_at)}</Td>
              <Td className="text-xs">{r.actor_email ?? r.actor_id?.slice(0, 8) ?? "system"}</Td>
              <Td className="font-mono text-xs">{r.action}</Td>
              <Td>{r.summary ?? "—"}</Td>
            </tr>
          ))}
        </Table>
      )}
      <p className="mt-4 text-xs text-paper-100/35">
        Written server-side on every privileged action. Role changes and comped access appear here
        with the address that made them.
      </p>
    </Panel>
  );
}
