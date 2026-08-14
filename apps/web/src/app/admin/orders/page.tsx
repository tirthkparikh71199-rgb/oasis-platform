import Link from "next/link";
import { and, desc, eq, sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { ORDER_STATUS_STYLES } from "@/lib/orders";

export const metadata = { title: "Orders | Oasis Impex Admin" };

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const user = await requireUser();
  requirePerm(user, "orders.read", "/admin");
  const { status, q } = await searchParams;

  const rows = await db()
    .select({
      order: schema.orders,
      customer: schema.customers.name,
      product: schema.products.name,
      createdByName: schema.users.name,
    })
    .from(schema.orders)
    .innerJoin(schema.customers, eq(schema.orders.customerId, schema.customers.id))
    .leftJoin(schema.products, eq(schema.orders.productId, schema.products.id))
    .leftJoin(schema.users, eq(schema.orders.createdBy, schema.users.id))
    .where(
      and(
        status ? eq(schema.orders.status, status as never) : sql`TRUE`,
        q ? sql`(${schema.orders.orderNumber} ILIKE ${`%${q}%`} OR ${schema.customers.name} ILIKE ${`%${q}%`})` : sql`TRUE`,
      ),
    )
    .orderBy(desc(schema.orders.createdAt));

  const statuses = ["NEW", "CONFIRMED", "IN_PROGRESS", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <Link
          href="/admin/orders/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-accent/90"
        >
          + New order
        </Link>
      </div>

      <form className="mt-5 flex flex-col gap-3 sm:flex-row" method="get">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search order no. or customer…"
          className="flex-1 rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white">
          Filter
        </button>
      </form>

      <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Expected</th>
              <th className="px-4 py-3">Entered by</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  No orders found. Create the first one.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.order.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${r.order.id}`} className="font-semibold text-slate-200 hover:text-accent">
                      {r.order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{r.customer}</td>
                  <td className="px-4 py-3 text-slate-400">{r.product ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {r.order.quantity ?? "—"}
                    {r.order.unit ? <span className="text-xs text-slate-500"> {r.order.unit}</span> : null}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_STYLES[r.order.status] ?? ""}`}>
                      {r.order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{r.order.expectedDate ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-400">{r.createdByName ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{r.order.createdAt.toLocaleDateString("en-IN")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
