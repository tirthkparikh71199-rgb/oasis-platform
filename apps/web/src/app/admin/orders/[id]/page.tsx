import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { ORDER_STATUS_STYLES } from "@/lib/orders";
import { OrderForm } from "../order-form";
import { deleteOrder, updateOrderStatus } from "../actions";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  requirePerm(user, "orders.read", "/admin");
  const { id } = await params;

  const rows = await db()
    .select({
      order: schema.orders,
      customer: schema.customers,
      product: schema.products,
      createdByName: schema.users.name,
    })
    .from(schema.orders)
    .innerJoin(schema.customers, eq(schema.orders.customerId, schema.customers.id))
    .leftJoin(schema.products, eq(schema.orders.productId, schema.products.id))
    .leftJoin(schema.users, eq(schema.orders.createdBy, schema.users.id))
    .where(eq(schema.orders.id, id))
    .limit(1);

  if (rows.length === 0) notFound();
  const r = rows[0];

  const [customers, products] = await Promise.all([
    db().select({ id: schema.customers.id, name: schema.customers.name }).from(schema.customers).orderBy(schema.customers.name),
    db().select({ id: schema.products.id, name: schema.products.name }).from(schema.products).orderBy(schema.products.name),
  ]);

  const canEdit = user.permissions.includes("orders.write") || user.roles.includes("SUPER_ADMIN");
  const canManage = user.permissions.includes("orders.manage") || user.roles.includes("SUPER_ADMIN");

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/orders" className="text-xs text-slate-400 hover:text-white">
            ← Orders
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-white">{r.order.orderNumber}</h1>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${ORDER_STATUS_STYLES[r.order.status] ?? ""}`}>{r.order.status}</span>
      </div>

      {canEdit && canManage ? (
        <>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Customer</dt>
                    <dd className="mt-1 font-semibold text-slate-200">{r.customer.name}</dd>
                    <dd className="text-sm text-slate-400">{r.customer.company}</dd>
                    <dd className="text-sm text-slate-400">{r.customer.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Product</dt>
                    <dd className="mt-1 font-semibold text-slate-200">{r.product?.name ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Quantity</dt>
                    <dd className="mt-1 font-semibold text-slate-200">
                      {r.order.quantity ?? "—"} {r.order.unit ? <span className="text-sm text-slate-400">{r.order.unit}</span> : null}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Expected date</dt>
                    <dd className="mt-1 text-slate-300">{r.order.expectedDate ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Entered by</dt>
                    <dd className="mt-1 text-slate-300">{r.createdByName ?? "—"}</dd>
                  </div>
                </dl>
                {r.order.notes ? (
                  <p className="mt-4 rounded-lg bg-slate-950/50 p-3 text-sm text-slate-300">{r.order.notes}</p>
                ) : null}
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Quick status update</h2>
                <form action={updateOrderStatus} className="mt-3 flex items-center gap-3">
                  <input type="hidden" name="id" value={r.order.id} />
                  <select
                    name="status"
                    defaultValue={r.order.status}
                    className="flex-1 rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
                  >
                    {["NEW", "CONFIRMED", "IN_PROGRESS", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-accent/90">
                    Update
                  </button>
                </form>
              </div>

              {canManage ? (
                <form action={deleteOrder} className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                  <input type="hidden" name="id" value={r.order.id} />
                  <h2 className="text-sm font-bold uppercase tracking-wide text-red-300">Danger zone</h2>
                  <button className="mt-3 rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10">
                    Delete order
                  </button>
                </form>
              ) : null}
            </div>

            <OrderForm order={{ ...r.order }} customers={customers} products={products} />
          </div>
        </>
      ) : (
        <p className="mt-6 text-sm text-slate-400">
          You don&apos;t have permission to edit orders. Contact an admin.
        </p>
      )}
    </div>
  );
}
