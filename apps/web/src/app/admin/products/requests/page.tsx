import { desc, eq, sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { deleteRequest, updateRequestStatus } from "./actions";

export const metadata = { title: "Product Requests | Oasis Impex Admin" };

export const dynamic = "force-dynamic";

const STATUSES = ["NEW", "QUOTING", "ORDERED", "AVAILABLE", "DECLINED"] as const;
type ReqStatus = (typeof STATUSES)[number];

const STATUS_STYLE: Record<string, string> = {
  NEW: "bg-blue-500/10 text-blue-300",
  QUOTING: "bg-amber-500/10 text-amber-300",
  ORDERED: "bg-violet-500/10 text-violet-300",
  AVAILABLE: "bg-emerald-500/10 text-emerald-300",
  DECLINED: "bg-red-500/10 text-red-300",
};

export default async function AdminProductRequestsPage({ searchParams }: { searchParams: Promise<{ status?: string; saved?: string }> }) {
  const user = await requireUser();
  requirePerm(user, "requests.read", "/admin/products");
  const { status, saved } = await searchParams;

  const filter: ReqStatus | null = STATUSES.includes(status as ReqStatus) ? (status as ReqStatus) : null;
  const rows = await db()
    .select()
    .from(schema.productRequests)
    .where(filter ? eq(schema.productRequests.status, filter) : undefined)
    .orderBy(desc(schema.productRequests.createdAt));

  const counts = await db()
    .select({ status: schema.productRequests.status, n: sql<number>`count(*)::int` })
    .from(schema.productRequests)
    .groupBy(schema.productRequests.status);

  const countMap = new Map(counts.map((c) => [c.status, c.n]));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Product Requests</h1>
        <div className="flex flex-wrap gap-1.5">
          <a href="/admin/products/requests" className={`rounded-full px-3 py-1 text-xs font-medium ${!filter ? "bg-accent text-slate-950" : "border border-white/10 text-slate-300"}`}>
            All ({counts.reduce((s, c) => s + c.n, 0)})
          </a>
          {STATUSES.map((s) => (
            <a
              key={s}
              href={`/admin/products/requests${s ? `?status=${s}` : ""}`}
              className={`rounded-full px-3 py-1 text-xs font-medium ${filter === s ? "bg-accent text-slate-950" : "border border-white/10 text-slate-300"}`}
            >
              {s} ({countMap.get(s) ?? 0})
            </a>
          ))}
        </div>
      </div>
      {saved ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Request updated.</p> : null}
      <p className="mt-1 text-sm text-slate-400">Customers asking for products we don&apos;t currently list. Follow up and update the status here.</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
        {rows.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No product requests yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Received</th>
                <th className="px-4 py-3">Status / Notes</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((r) => (
                <tr key={r.id} className="align-top hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-200">{r.productName}</p>
                    {r.gradeSpec ? <p className="mt-0.5 text-xs text-slate-500">{r.gradeSpec}</p> : null}
                    {r.message ? <p className="mt-1 max-w-[260px] text-xs text-slate-400">{r.message}</p> : null}
                  </td>
                  <td className="px-4 py-3">
                    {r.company ? <p className="text-slate-300">{r.company}</p> : null}
                    {r.email ? (
                      <a href={`mailto:${r.email}`} className="mt-0.5 block text-xs text-accent hover:underline">
                        {r.email}
                      </a>
                    ) : null}
                    {r.phone ? <p className="mt-0.5 text-xs text-slate-400">{r.phone}</p> : null}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {r.quantity ?? "—"} {r.unit ?? ""}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{r.createdAt.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <form action={updateRequestStatus} className="flex flex-col gap-2">
                      <input type="hidden" name="id" value={r.id} />
                      <div className="flex items-center gap-2">
                        <select name="status" defaultValue={r.status} className="rounded-lg border border-white/10 bg-slate-950/60 px-2 py-1.5 text-xs text-white outline-none focus:border-accent">
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[r.status]}`}>{r.status}</span>
                      </div>
                      <input name="notes" defaultValue={r.notes ?? ""} placeholder="Internal notes…" className="rounded-lg border border-white/10 bg-slate-950/60 px-2 py-1.5 text-xs text-white outline-none focus:border-accent" />
                      <button type="submit" className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5">
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <form action={deleteRequest}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="rounded-lg border border-red-500/20 px-2.5 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/10">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
