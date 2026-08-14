import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { createPage, deletePage } from "./actions";

export const metadata = { title: "Pages | Oasis Impex Admin" };

export const dynamic = "force-dynamic";

export default async function AdminPagesPage({ searchParams }: { searchParams: Promise<{ created?: string; updated?: string }> }) {
  const user = await requireUser();
  requirePerm(user, "settings.read", "/admin");
  const { created, updated } = await searchParams;
  const pages = await db().select().from(schema.dynamicPages).orderBy(schema.dynamicPages.sortOrder);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Pages</h1>
          <p className="mt-1 text-sm text-slate-400">{pages.length} pages. Create new routes from admin.</p>
        </div>
        <a href="#add-page" className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-slate-950">+ Page</a>
      </div>

      {created ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Page created.</p> : null}
      {updated ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Page updated.</p> : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {pages.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-slate-500">No pages yet.</p>
          ) : pages.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div>
                <p className="font-semibold text-slate-200">{p.title}</p>
                <p className="text-xs text-slate-500">/{p.slug} · {p.isPublished ? "Live" : "Draft"}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={`/${p.slug}`} target="_blank" className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:text-white">View</a>
                <a href={`/admin/pages/${p.id}`} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:text-white">Edit</a>
                <form action={deletePage}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="rounded-lg border border-red-500/20 px-2.5 py-1.5 text-xs text-red-300 hover:bg-red-500/10">Delete</button>
                </form>
              </div>
            </div>
          ))}
        </div>

        <div id="add-page" className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Create Page</h2>
          <form action={createPage} className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Title *</span>
              <input name="title" required placeholder="About Our Team" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Meta Title</span>
              <input name="metaTitle" placeholder="SEO title" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Meta Description</span>
              <textarea name="metaDescription" rows={2} placeholder="SEO description" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
            </label>
            <p className="text-xs text-slate-500">Slug is auto-generated from title. Edit content after creation.</p>
            <button className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-accent/90">Create Page</button>
          </form>
        </div>
      </div>
    </div>
  );
}
