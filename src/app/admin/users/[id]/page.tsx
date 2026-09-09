import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getUserDetail } from "@/lib/admin/queries";
import { getCurrentUser } from "@/lib/auth/current-user";
import { RoleControl } from "@/components/admin/RoleControl";
import { Badge, Empty, Panel, Stat, Table, Td, date, dateTime, money } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Admin · User" };
export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [u, actor] = await Promise.all([getUserDetail(id), getCurrentUser()]);
  if (!u) notFound();

  const title = (r: { assessments?: { title?: string } | null }) => r.assessments?.title ?? "—";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin/users" className="focus-ring rounded text-xs text-signal-cyan hover:underline">
          ← All users
        </Link>
        <h2 className="mt-2 font-display text-2xl text-paper-100">
          {u.profile.full_name ?? u.profile.display_name ?? "Unnamed user"}
        </h2>
        <p className="mt-1 text-sm text-paper-100/55">{u.email ?? "no email on record"}</p>
        <p className="mt-1 font-mono text-xs text-paper-100/30">{u.profile.id}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Role"
          value={
            <RoleControl
              userId={u.profile.id}
              currentRole={u.profile.role}
              canGrantSuperAdmin={actor?.profile?.role === "super_admin"}
            />
          }
        />
        <Stat label="Joined" value={date(u.profile.created_at)} sub={`Last seen ${date(u.lastSignInAt)}`} />
        <Stat label="Lifetime spend" value={u.spendCents > 0 ? money(u.spendCents) : "—"} />
        <Stat
          label="Assessments"
          value={u.attempts.length}
          sub={`${u.attempts.filter((a) => a.status === "completed").length} completed`}
        />
      </div>

      <Panel title="Purchases">
        {u.purchases.length === 0 ? (
          <Empty>No purchases.</Empty>
        ) : (
          <Table head={["Date", "Item", "Amount", "Stripe payment intent"]}>
            {u.purchases.map((p) => (
              <tr key={p.id}>
                <Td className="whitespace-nowrap">{dateTime(p.created_at)}</Td>
                <Td>{title(p as never) === "—" ? "Collection / bundle" : title(p as never)}</Td>
                <Td>{money(p.amount_cents, p.currency)}</Td>
                <Td className="font-mono text-xs">{p.stripe_payment_intent_id ?? "—"}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <Panel title="Results">
        {u.results.length === 0 ? (
          <Empty>No completed results yet.</Empty>
        ) : (
          <Table head={["Assessment", "Score", "Taken", "Shared", ""]}>
            {u.results.map((r) => (
              <tr key={r.id}>
                <Td>{title(r as never)}</Td>
                <Td className="font-display text-paper-100">{Math.round(Number(r.overall_score))}</Td>
                <Td className="whitespace-nowrap">{dateTime(r.created_at)}</Td>
                <Td>{r.is_public_share ? <Badge value="public" /> : "private"}</Td>
                <Td>
                  <Link
                    href={`/results/${r.attempt_id}`}
                    className="focus-ring rounded text-xs text-signal-cyan hover:underline"
                  >
                    Open report
                  </Link>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <Panel title="All attempts">
        {u.attempts.length === 0 ? (
          <Empty>No attempts.</Empty>
        ) : (
          <Table head={["Assessment", "Status", "Progress", "Started", "Completed"]}>
            {u.attempts.map((a) => (
              <tr key={a.id}>
                <Td>{title(a as never)}</Td>
                <Td>
                  <Badge value={a.status} />
                </Td>
                <Td>{Math.round(Number(a.progress_percent))}%</Td>
                <Td className="whitespace-nowrap">{dateTime(a.started_at)}</Td>
                <Td className="whitespace-nowrap">{dateTime(a.completed_at)}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Brain Profile">
          {u.brainDimensions.length === 0 ? (
            <Empty>No brain profile yet.</Empty>
          ) : (
            <Table head={["Dimension", "Score"]}>
              {u.brainDimensions.map((d) => (
                <tr key={d.dimension_key}>
                  <Td className="capitalize">{d.dimension_key}</Td>
                  <Td className="font-display text-paper-100">{Math.round(Number(d.score))}</Td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>

        <Panel title="Perfect Love codes">
          {u.perfectLoveCodes.length === 0 ? (
            <Empty>None issued.</Empty>
          ) : (
            <Table head={["Code", "Status", "Issued", "Redeemed"]}>
              {u.perfectLoveCodes.map((c) => (
                <tr key={c.code}>
                  <Td className="font-mono text-xs">{c.code}</Td>
                  <Td>
                    <Badge value={c.status} />
                  </Td>
                  <Td className="whitespace-nowrap">{date(c.issued_at)}</Td>
                  <Td className="whitespace-nowrap">{date(c.redeemed_at)}</Td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>
      </div>
    </div>
  );
}
