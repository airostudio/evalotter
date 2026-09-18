import Link from "next/link";
import type { Metadata } from "next";
import { getFinancials } from "@/lib/admin/queries";
import { Badge, Empty, Panel, Stat, Table, Td, date, dateTime, money } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Admin · Financials" };
export const dynamic = "force-dynamic";

export default async function AdminFinancialsPage() {
  const f = await getFinancials();
  const thisMonth = f.byMonth[0];
  const redeemed = f.perfectLoveCodes.filter((c) => c.status === "redeemed").length;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total revenue" value={money(f.totalCents)} sub={`${f.purchases.length} purchases`} />
        <Stat
          label="This month"
          value={thisMonth ? money(thisMonth[1].cents) : money(0)}
          sub={thisMonth ? `${thisMonth[1].count} purchases` : "no purchases yet"}
        />
        <Stat
          label="Average order"
          value={f.purchases.length > 0 ? money(Math.round(f.totalCents / f.purchases.length)) : "—"}
        />
        <Stat
          label="Perfect Love codes"
          value={f.perfectLoveCodes.length}
          sub={`${redeemed} redeemed`}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Revenue by month">
          {f.byMonth.length === 0 ? (
            <Empty>No revenue yet.</Empty>
          ) : (
            <Table head={["Month", "Purchases", "Revenue"]}>
              {f.byMonth.map(([month, v]) => (
                <tr key={month}>
                  <Td>{month}</Td>
                  <Td>{v.count}</Td>
                  <Td className="font-display text-paper-100">{money(v.cents)}</Td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>

        <Panel title="Revenue by product">
          {f.byAssessment.length === 0 ? (
            <Empty>No revenue yet.</Empty>
          ) : (
            <Table head={["Product", "Purchases", "Revenue"]}>
              {f.byAssessment.map(([title, v]) => (
                <tr key={title}>
                  <Td>{title}</Td>
                  <Td>{v.count}</Td>
                  <Td className="font-display text-paper-100">{money(v.cents)}</Td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>
      </div>

      <Panel title="All purchases">
        {f.purchases.length === 0 ? (
          <Empty>No purchases yet.</Empty>
        ) : (
          <Table head={["Date", "User", "Item", "Amount", "Stripe payment intent"]}>
            {f.purchases.map((p) => (
              <tr key={p.id}>
                <Td className="whitespace-nowrap">{dateTime(p.created_at)}</Td>
                <Td>
                  <Link
                    href={`/admin/users/${p.user_id}`}
                    className="focus-ring rounded font-mono text-xs text-signal-cyan hover:underline"
                  >
                    {p.user_id.slice(0, 8)}…
                  </Link>
                </Td>
                <Td>{(p.assessments as { title?: string } | null)?.title ?? "Collection / bundle"}</Td>
                <Td className="font-display text-paper-100">{money(p.amount_cents, p.currency)}</Td>
                <Td className="font-mono text-xs">{p.stripe_payment_intent_id ?? "—"}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <Panel title="Perfect Love codes">
        {f.perfectLoveCodes.length === 0 ? (
          <Empty>None issued.</Empty>
        ) : (
          <Table head={["Code", "Status", "Issued", "Redeemed", "Redeemed by"]}>
            {f.perfectLoveCodes.map((c) => (
              <tr key={c.code}>
                <Td className="font-mono text-xs">{c.code}</Td>
                <Td>
                  <Badge value={c.status} />
                </Td>
                <Td className="whitespace-nowrap">{date(c.issued_at)}</Td>
                <Td className="whitespace-nowrap">{date(c.redeemed_at)}</Td>
                <Td>{c.redeemed_by_email ?? "—"}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <p className="text-xs text-paper-100/35">
        Figures come from the <code>report_purchases</code> ledger written by the Stripe webhook, not
        from Stripe directly — a purchase whose webhook never landed will be missing here. Reconcile
        against the Stripe dashboard before treating these as accounts.
      </p>
    </div>
  );
}
