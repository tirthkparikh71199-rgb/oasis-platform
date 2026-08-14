import Link from "next/link";
import { sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { deleteProduct } from "./actions";

export const metadata = { title: "Products | Oasis Impex Admin" };

export default async function AdminProductsPage() {
  const dbs = db();
  const products = await dbs
    .select({
      id: schema.products.id,
      name: schema.products.name,
      slug: schema.products.slug,
      sku: schema.products.sku,
      isPublic: schema.products.isPublic,
      isActive: schema.products.isActive,
      imageCount: sql<number>`(select count(*) from ${schema.productImages} where product_id = ${schema.products.id})::int`,
    })
    .from(schema.products)
    .orderBy(schema.products.createdAt);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-accent/90"
        >
          + New product
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Images</th>
              <th className="px-4 py-3">Visibility</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No products yet.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-semibold text-slate-200">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.sku ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-400">{p.imageCount}</td>
                  <td className="px-4 py-3">
                    {p.isPublic ? (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300">Public</span>
                    ) : (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-300">Hidden</span>
                    )}
                    {!p.isActive ? (
                      <span className="ml-1.5 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-300">Inactive</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-accent/40 hover:text-white"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/products/${p.slug}`}
                        target="_blank"
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-white/30 hover:text-white"
                      >
                        View
                      </Link>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:border-red-500/50 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
