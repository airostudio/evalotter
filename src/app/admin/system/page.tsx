import type { Metadata } from "next";
import { getAiHealth, getPalmistryQueue } from "@/lib/admin/queries";
import { adminEmails } from "@/lib/admin/access";
import { Badge, Empty, Panel, Stat, Table, Td, dateTime, pct } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Admin · System" };
export const dynamic = "force-dynamic";

/** Reports configuration presence only — never a key's value. */
function configured(name: string, value: string | undefined, note: string) {
  return { name, ok: Boolean(value), note };
}

export default async function AdminSystemPage() {
  const [ai, palms] = await Promise.all([getAiHealth(), getPalmistryQueue(25)]);

  const config = [
    configured("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL, "database + auth"),
    configured("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY, "required by this admin area"),
    configured("ANTHROPIC_API_KEY", process.env.ANTHROPIC_API_KEY, "AI interpretation and palm reading"),
    configured("STRIPE_SECRET_KEY", process.env.STRIPE_SECRET_KEY, "checkout"),
    configured("STRIPE_WEBHOOK_SECRET", process.env.STRIPE_WEBHOOK_SECRET, "purchase confirmation — without it, payments never unlock"),
    configured("NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL, "auth email links and Stripe redirects"),
    configured("ADMIN_EMAILS", process.env.ADMIN_EMAILS, "admin bootstrap"),
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="AI interpretations" value={ai.total.toLocaleString()} />
        <Stat
          label="Not completed"
          value={ai.failed.toLocaleString()}
          sub={ai.total > 0 ? `${pct(ai.failed / ai.total)} of all` : undefined}
        />
        <Stat label="Admin addresses" value={adminEmails().length} sub="via ADMIN_EMAILS" />
      </div>

      <Panel title="Configuration">
        <Table head={["Variable", "Status", "Used for"]}>
          {config.map((c) => (
            <tr key={c.name}>
              <Td className="font-mono text-xs">{c.name}</Td>
              <Td><Badge value={c.ok ? "set" : "missing"} /></Td>
              <Td className="text-paper-100/55">{c.note}</Td>
            </tr>
          ))}
        </Table>
        <p className="mt-4 text-xs text-paper-100/35">
          Presence only — no value is ever read into this page. NEXT_PUBLIC_* variables are baked in
          at build time, so changing one requires a rebuild, not just a restart.
        </p>
      </Panel>

      <Panel title="Recent AI interpretations">
        {ai.recent.length === 0 ? (
          <Empty>None generated yet.</Empty>
        ) : (
          <Table head={["When", "Status", "Result"]}>
            {ai.recent.map((r) => (
              <tr key={r.id}>
                <Td className="whitespace-nowrap">{dateTime(r.created_at)}</Td>
                <Td><Badge value={r.status} /></Td>
                <Td className="font-mono text-xs">{String(r.result_id).slice(0, 8)}…</Td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <Panel title="Palmistry submissions">
        {palms.length === 0 ? (
          <Empty>No submissions.</Empty>
        ) : (
          <Table head={["When", "Status", "User"]}>
            {palms.map((p) => (
              <tr key={p.id}>
                <Td className="whitespace-nowrap">{dateTime(p.created_at)}</Td>
                <Td><Badge value={p.status} /></Td>
                <Td className="font-mono text-xs">{String(p.user_id).slice(0, 8)}…</Td>
              </tr>
            ))}
          </Table>
        )}
        <p className="mt-4 text-xs text-paper-100/35">
          Metadata only. Palm photos are biometric-adjacent personal data held in a private bucket;
          they are deliberately not surfaced here, and should be opened only with a specific reason.
        </p>
      </Panel>
    </div>
  );
}
