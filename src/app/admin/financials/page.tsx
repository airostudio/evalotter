import Link from "next/link";
import type { Metadata } from "next";
import { getFinancials, getSubscriptionStats } from "@/lib/admin/queries";
import { Badge, Empty, Panel, Stat, Table, Td, date, dateTime, money } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Admin · Financials" };
export const dynamic = "force-dynamic";

export default async function AdminFinancialsPage() {
  const [f, subs] = await Promise.all([getFinancials(), getSubscriptionStats()]);
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

      <Panel title="Driftwater subscriptions">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Paying" value={subs.paying} sub={`${subs.trialing} on trial`} />
          <Stat label="Monthly recurring" value={money(subs.mrrCents)} sub="paying subscribers only" />
          <Stat label="Past due" value={subs.pastDue} />
          <Stat label="Cancelled" value={subs.canceled} sub={`${subs.total} ever started`} />
        </div>
        {subs.recent.length === 0 ? (
          <div className="mt-5"><Empty>No subscriptions yet.</Empty></div>
        ) : (
          <div className="mt-5">
            <Table head={["User", "Plan", "Status", "Period ends"]}>
              {subs.recent.map((r) => (
                <tr key={`${r.user_id}-${r.created_at}`}>
                  <Td>
                    <Link
                      href={`/admin/users/${r.user_id}`}
                      className="focus-ring rounded font-mono text-xs text-signal-cyan hover:underline"
                    >
                      {r.user_id.slice(0, 8)}…
                    </Link>
                  </Td>
                  <Td className="font-mono text-xs">{r.plan}</Td>
                  <Td><Badge value={r.status} /></Td>
                  <Td className="whitespace-nowrap">{date(r.current_period_end)}</Td>
                </tr>
              ))}
            </Table>
          </div>
        )}
        <p className="mt-4 text-xs text-paper-100/35">
          Mirrored from Stripe by webhook. A trial counts as live access but contributes nothing to
          recurring revenue until it converts.
        </p>
      </Panel>

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
