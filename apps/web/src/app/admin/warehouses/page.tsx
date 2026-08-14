import { eq, sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { createWarehouse, deleteWarehouse, setStock } from "./actions";

export const metadata = { title: "Warehouses & Stock | Oasis Impex Admin" };

const STATUS_STYLES: Record<string, string> = {
  AVAILABLE: "bg-emerald-500/10 text-emerald-300",
  LOW_STOCK: "bg-amber-500/10 text-amber-300",
  OUT_OF_STOCK: "bg-red-500/10 text-red-300",
  IN_TRANSIT: "bg-sky-500/10 text-sky-300",
};

export default async function AdminWarehousesPage() {
  const dbs = db();
  const warehouses = await dbs.select().from(schema.warehouses).orderBy(schema.warehouses.createdAt);
  const stock = await dbs
    .select({
      id: schema.inventory.id,
      productId: schema.inventory.productId,
      productName: schema.products.name,
      warehouseId: schema.inventory.warehouseId,
      warehouseName: schema.warehouses.name,
      quantity: schema.inventory.quantity,
      reserved: schema.inventory.reservedQuantity,
      threshold: schema.inventory.lowStockThreshold,
      status: schema.inventory.status,
      unit: schema.inventory.unit,
    })
    .from(schema.inventory)
    .innerJoin(schema.products, eq(schema.inventory.productId, schema.products.id))
    .innerJoin(schema.warehouses, eq(schema.inventory.warehouseId, schema.warehouses.id))
    .orderBy(schema.inventory.lastUpdated);

  const products = await dbs
    .select({ id: schema.products.id, name: schema.products.name })
    .from(schema.products)
    .where(sql`not exists (select 1 from ${schema.inventory} where product_id = ${schema.products.id})`);

  const byWarehouse = warehouses.map((w) => ({ ...w, stock: stock.filter((s) => s.warehouseId === w.id) }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Warehouses &amp; stock</h1>

      {byWarehouse.map((w) => (
        <section key={w.id} className="mt-6 rounded-xl border border-white/10 bg-white/[0.03]">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
            <div>
              <h2 className="font-bold text-white">{w.name}</h2>
              <p className="text-xs text-slate-500">
                {[w.code, w.location, w.address].filter(Boolean).join(" · ") || "No address set"}
              </p>
            </div>
            <form action={deleteWarehouse}>
              <input type="hidden" name="id" value={w.id} />
              <button className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300">
                Delete
              </button>
            </form>
          </div>
          <div className="divide-y divide-white/5">
            {w.stock.length === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-500">No stock recorded for this warehouse.</p>
            ) : (
              w.stock.map((s) => (
                <div key={s.id} className="grid gap-3 px-5 py-3 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{s.productName}</p>
                    <p className="text-xs text-slate-500">On hand: {s.quantity} {s.unit ?? ""} · Reserved: {s.reserved}</p>
                  </div>
                  <span className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[s.status]}`}>{s.status}</span>
                  <form action={setStock} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={s.id} />
                    <input
                      name="quantity"
                      defaultValue={s.quantity}
                      className="w-24 rounded-lg border border-white/10 bg-slate-950/60 px-2 py-1.5 text-xs text-white outline-none focus:border-accent"
                    />
                    <input
                      name="lowStockThreshold"
                      defaultValue={s.threshold ?? ""}
                      placeholder="low"
                      className="w-16 rounded-lg border border-white/10 bg-slate-950/60 px-2 py-1.5 text-xs text-white outline-none placeholder:text-slate-600 focus:border-accent"
                    />
                    <select
                      name="status"
                      defaultValue={s.status}
                      className="rounded-lg border border-white/10 bg-slate-950/60 px-2 py-1.5 text-xs text-white outline-none focus:border-accent"
                    >
                      <option>AVAILABLE</option>
                      <option>LOW_STOCK</option>
                      <option>OUT_OF_STOCK</option>
                      <option>IN_TRANSIT</option>
                    </select>
                    <button className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/15">Update</button>
                  </form>
                </div>
              ))
            )}
          </div>
        </section>
      ))}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Add warehouse</h2>
          <form action={createWarehouse} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              name="name"
              required
              placeholder="Name (e.g. Santej Warehouse)"
              className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-accent sm:col-span-2"
            />
            <input
              name="code"
              placeholder="Code"
              className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-accent"
            />
            <input
              name="location"
              placeholder="Location"
              className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-accent"
            />
            <input
              name="contactName"
              placeholder="Contact name"
              className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-accent"
            />
            <input
              name="contactPhone"
              placeholder="Contact phone"
              className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-accent"
            />
            <textarea
              name="address"
              rows={2}
              placeholder="Full address"
              className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-accent sm:col-span-2"
            />
            <button className="rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-accent/90 sm:col-span-2">
              Add warehouse
            </button>
          </form>
        </section>

        {products.length > 0 ? (
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Unstocked products</h2>
            <ul className="mt-3 divide-y divide-white/5">
              {products.map((p) => (
                <li key={p.id} className="py-2 text-sm text-slate-300">
                  {p.name}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
