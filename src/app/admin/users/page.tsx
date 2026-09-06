import Link from "next/link";
import type { Metadata } from "next";
import { listUsers } from "@/lib/admin/queries";
import { Badge, Empty, Panel, Table, Td, date, money } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Admin · Users" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const pageNum = Math.max(1, Number(page ?? 1) || 1);
  const { rows, total } = await listUsers({
    search: q,
    limit: PAGE_SIZE,
    offset: (pageNum - 1) * PAGE_SIZE,
  });
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-5">
      <form method="get" className="flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name…"
          className="focus-ring w-full max-w-sm rounded-xl2 border border-ink-600 bg-ink-800/60 px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-100/30"
        />
        <button
          type="submit"
          className="focus-ring rounded-xl2 border border-ink-600 px-4 text-sm text-paper-100 hover:border-ink-500"
        >
          Search
        </button>
      </form>

      <Panel title={`${total.toLocaleString()} user${total === 1 ? "" : "s"}`}>
        {rows.length === 0 ? (
          <Empty>No users found.</Empty>
        ) : (
          <Table head={["User", "Role", "Joined", "Attempts", "Completed", "Spend", ""]}>
            {rows.map((u) => (
              <tr key={u.id}>
                <Td>
                  <span className="block text-paper-100">{u.fullName ?? "—"}</span>
                  <span className="block text-xs text-paper-100/45">{u.email ?? u.id.slice(0, 8)}</span>
                </Td>
                <Td>
                  <Badge value={u.role} />
                </Td>
                <Td className="whitespace-nowrap">{date(u.createdAt)}</Td>
                <Td>{u.attempts}</Td>
                <Td>{u.completed}</Td>
                <Td>{u.spendCents > 0 ? money(u.spendCents) : "—"}</Td>
                <Td>
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="focus-ring rounded text-xs text-signal-cyan hover:underline"
                  >
                    Drill down
                  </Link>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-paper-100/60">
          <span>
            Page {pageNum} of {pages}
          </span>
          <div className="flex gap-2">
            {pageNum > 1 && (
              <Link
                href={`/admin/users?${new URLSearchParams({ ...(q ? { q } : {}), page: String(pageNum - 1) })}`}
                className="focus-ring rounded-xl2 border border-ink-600 px-4 py-2 hover:border-ink-500"
              >
                Previous
              </Link>
            )}
            {pageNum < pages && (
              <Link
                href={`/admin/users?${new URLSearchParams({ ...(q ? { q } : {}), page: String(pageNum + 1) })}`}
                className="focus-ring rounded-xl2 border border-ink-600 px-4 py-2 hover:border-ink-500"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
