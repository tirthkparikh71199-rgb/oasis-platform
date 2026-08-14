import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { createNavItem, deleteNavItem, reorderNav } from "./actions";

export const metadata = { title: "Navigation | Oasis Impex Admin" };

export const dynamic = "force-dynamic";

export default async function AdminNavigationPage({ searchParams }: { searchParams: Promise<{ created?: string; updated?: string; error?: string }> }) {
  const user = await requireUser();
  requirePerm(user, "settings.read", "/admin");
  const { created, updated, error } = await searchParams;
  const items = await db().select().from(schema.navigationItems).orderBy(schema.navigationItems.sortOrder);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Navigation</h1>
          <p className="mt-1 text-sm text-slate-400">{items.length} items. Control the public site navigation from here.</p>
        </div>
        <a href="#add-item" className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-slate-950">+ Nav Item</a>
      </div>

      {created ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Created.</p> : null}
      {updated ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Updated.</p> : null}
      {error ? <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">Error: {error}</p> : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Current Navigation</h2>
          <form action={reorderNav} className="mt-4 space-y-2">
            {items.length === 0 ? (
              <p className="text-sm text-slate-500">No navigation items yet.</p>
            ) : items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-lg bg-slate-950/40 px-3 py-2.5">
                <input type="hidden" name="ids" value={item.id} />
                <span className="cursor-grab text-slate-500">⋮⋮</span>
                <span className={`flex-1 text-sm ${item.isPublished ? "text-white" : "text-slate-500 line-through"}`}>
                  {item.label}
                  <span className="ml-2 text-xs text-slate-600">{item.href}</span>
                </span>
                <span className="text-xs text-slate-600">#{item.sortOrder}</span>
                <form action={deleteNavItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <button className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                </form>
              </div>
            ))}
            {items.length > 0 && (
              <button className="mt-3 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:text-white">Save Order</button>
            )}
          </form>
        </div>

        <div id="add-item" className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Add Navigation Item</h2>
          <form action={createNavItem} className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Label *</span>
              <input name="label" required className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-300">URL *</span>
              <input name="href" required placeholder="/products" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Sort Order</span>
              <input name="sortOrder" type="number" defaultValue="0" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isPublished" defaultChecked className="rounded border-white/20 bg-slate-950/60 text-accent focus:ring-accent" />
              <span className="text-xs font-medium text-slate-300">Published</span>
            </label>
            <button className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-accent/90">Add Item</button>
          </form>
        </div>
      </div>
    </div>
  );
}
