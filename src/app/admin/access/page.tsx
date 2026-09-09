import type { Metadata } from "next";
import Link from "next/link";
import { listPrivilegedUsers } from "@/lib/admin/queries";
import { adminEmails } from "@/lib/admin/access";
import { Badge, Empty, Panel, Table, Td, date } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Admin · Access" };
export const dynamic = "force-dynamic";

export default async function AdminAccessPage() {
  const [privileged, allowlist] = [await listPrivilegedUsers(), adminEmails()];

  return (
    <div className="flex flex-col gap-8">
      <Panel title="Who has elevated access">
        {privileged.length === 0 ? (
          <Empty>Nobody holds an elevated role.</Empty>
        ) : (
          <Table head={["Name", "Role", "Since", ""]}>
            {privileged.map((p) => (
              <tr key={p.id}>
                <Td>{p.full_name ?? p.display_name ?? "Unnamed"}</Td>
                <Td><Badge value={p.role} /></Td>
                <Td className="whitespace-nowrap">{date(p.created_at)}</Td>
                <Td>
                  <Link href={`/admin/users/${p.id}`} className="focus-ring rounded text-xs text-signal-cyan hover:underline">
                    Manage
                  </Link>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <Panel title="Bootstrap allowlist (ADMIN_EMAILS)">
        {allowlist.length === 0 ? (
          <Empty>
            ADMIN_EMAILS is not set. With no allowlist and no existing admin, the only way into this
            area is editing profiles.role in the database by hand.
          </Empty>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {allowlist.map((e) => (
              <li key={e} className="font-mono text-sm text-paper-100/80">{e}</li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs leading-relaxed text-paper-100/40">
          These addresses are promoted to admin on sign-in. It is a floor, not a ceiling: it never
          demotes anyone and never overrides a super admin. Change it in your deploy environment;
          day-to-day role changes belong on a user&apos;s page, where they are recorded in the audit
          log.
        </p>
      </Panel>
    </div>
  );
}
