import { desc, eq, sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { createWarehouse, upsertInventory, deleteInventory } from "./actions";

export const metadata = { title: "Inventory | Oasis Impex Admin" };

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage({ searchParams }: { searchParams: Promise<{ created?: string; updated?: string; error?: string; warehouse?: string }> }) {
  const user = await requireUser();
  requirePerm(user, "inventory.read", "/admin");
  const { created, updated, error, warehouse } = await searchParams;

  const [warehouses, inventory, products, lowStock] = await Promise.all([
    db().select().from(schema.warehouses).orderBy(schema.warehouses.name),
    db()
      .select({
        id: schema.inventory.id,
        quantity: schema.inventory.quantity,
        unit: schema.inventory.unit,
        status: schema.inventory.status,
        lowStockThreshold: schema.inventory.lowStockThreshold,
        notes: schema.inventory.notes,
        lastUpdated: schema.inventory.lastUpdated,
        productName: schema.products.name,
        productSku: schema.products.sku,
        warehouseName: schema.warehouses.name,
      })
      .from(schema.inventory)
      .innerJoin(schema.products, eq(schema.inventory.productId, schema.products.id))
      .innerJoin(schema.warehouses, eq(schema.inventory.warehouseId, schema.warehouses.id))
      .orderBy(desc(schema.inventory.lastUpdated)),
    db().select({ id: schema.products.id, name: schema.products.name, sku: schema.products.sku }).from(schema.products).orderBy(schema.products.name),
    db()
      .select({
        productName: schema.products.name,
        warehouseName: schema.warehouses.name,
        quantity: schema.inventory.quantity,
        threshold: schema.inventory.lowStockThreshold,
      })
      .from(schema.inventory)
      .innerJoin(schema.products, eq(schema.inventory.productId, schema.products.id))
      .innerJoin(schema.warehouses, eq(schema.inventory.warehouseId, schema.warehouses.id))
      .where(sql`${schema.inventory.lowStockThreshold} is not null AND ${schema.inventory.quantity}::numeric <= ${schema.inventory.lowStockThreshold}::numeric`),
  ]);

  const totalStock = inventory.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
  const totalProducts = new Set(inventory.map((i) => i.productName)).size;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory</h1>
          <p className="mt-1 text-sm text-slate-400">{totalProducts} products tracked across {warehouses.length} warehouses. Total stock: {totalStock.toLocaleString()} units.</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="#add-warehouse" className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:text-white">+ Warehouse</a>
          <a href="#add-stock" className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-slate-950">+ Stock</a>
        </div>
      </div>

      {created ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Created.</p> : null}
      {updated ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Updated.</p> : null}
      {error ? <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">Error: {error}</p> : null}

      {lowStock.length > 0 && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          <h2 className="text-sm font-bold text-red-300">Low Stock Alert ({lowStock.length})</h2>
          <div className="mt-2 space-y-1">
            {lowStock.map((l, i) => (
              <p key={i} className="text-xs text-red-200">{l.productName} — {l.quantity} at {l.warehouseName} (threshold: {l.threshold})</p>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Warehouse</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Updated</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {inventory.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No inventory records yet. Add stock above.</td></tr>
              ) : inventory.map((i) => (
                <tr key={i.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-200">{i.productName}</span>
                    {i.productSku ? <span className="ml-2 text-xs text-slate-500">SKU: {i.productSku}</span> : null}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{i.warehouseName}</td>
                  <td className="px-4 py-3 text-slate-300">{Number(i.quantity).toLocaleString()} {i.unit ?? ""}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${i.status === "AVAILABLE" ? "bg-emerald-500/10 text-emerald-300" : i.status === "LOW_STOCK" ? "bg-amber-500/10 text-amber-300" : "bg-red-500/10 text-red-300"}`}>{i.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{new Date(i.lastUpdated).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <form action={deleteInventory} className="inline">
                      <input type="hidden" name="id" value={i.id} />
                      <button className="rounded-lg border border-red-500/20 px-2.5 py-1.5 text-xs text-red-300 hover:bg-red-500/10">Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          <div id="add-stock" className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Add / Update Stock</h2>
            <form action={upsertInventory} className="mt-4 space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-slate-300">Product *</span>
                <select name="productId" required className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent">
                  <option value="">Select product</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}{p.sku ? ` (${p.sku})` : ""}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-300">Warehouse *</span>
                <select name="warehouseId" required defaultValue={warehouse ?? ""} className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent">
                  <option value="">Select warehouse</option>
                  {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium text-slate-300">Quantity *</span>
                  <input name="quantity" type="number" step="0.01" required className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-300">Unit</span>
                  <input name="unit" placeholder="MT" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-medium text-slate-300">Low Stock Threshold</span>
                <input name="lowStockThreshold" type="number" step="0.01" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-300">Notes</span>
                <input name="notes" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
              </label>
              <button className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-accent/90">Save Stock</button>
            </form>
          </div>

          <div id="add-warehouse" className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Add Warehouse</h2>
            <form action={createWarehouse} className="mt-4 space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-slate-300">Name *</span>
                <input name="name" required className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-300">Code</span>
                <input name="code" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-300">Location</span>
                <input name="location" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
              </label>
              <button className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-accent/90">Add Warehouse</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
