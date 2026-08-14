import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { createTestimonial, deleteTestimonial } from "./actions";

export const metadata = { title: "Testimonials | Oasis Impex Admin" };

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage({ searchParams }: { searchParams: Promise<{ created?: string; updated?: string }> }) {
  const user = await requireUser();
  requirePerm(user, "settings.read", "/admin");
  const { created, updated } = await searchParams;
  const rows = await db().select().from(schema.testimonials).orderBy(schema.testimonials.sortOrder);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Testimonials</h1>
          <p className="mt-1 text-sm text-slate-400">{rows.length} testimonials. Published ones appear on the homepage.</p>
        </div>
        <a href="#add-testimonial" className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-slate-950">+ Testimonial</a>
      </div>
      {created ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Created.</p> : null}
      {updated ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Updated.</p> : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-3">
          {rows.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-slate-500">No testimonials yet.</p>
          ) : rows.map((t) => (
            <div key={t.id} className={`rounded-xl border border-white/10 bg-white/[0.03] p-4 ${t.isPublished ? "" : "opacity-50"}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-100">&ldquo;{t.quote}&rdquo;</p>
                  <p className="mt-1 text-xs text-slate-400">{t.customerName} {t.company ? `— ${t.company}` : ""} · {t.rating ?? 5}★</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${t.isPublished ? "bg-emerald-500/10 text-emerald-300" : "bg-slate-500/10 text-slate-400"}`}>{t.isPublished ? "Published" : "Draft"}</span>
                  <form action={deleteTestimonial}>
                    <input type="hidden" name="id" value={t.id} />
                    <button className="rounded-lg border border-red-500/20 px-2.5 py-1.5 text-xs text-red-300 hover:bg-red-500/10">Delete</button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div id="add-testimonial" className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Add Testimonial</h2>
          <form action={createTestimonial} className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Customer Name *</span>
              <input name="customerName" required className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Company</span>
              <input name="company" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Quote *</span>
              <textarea name="quote" required rows={4} className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-slate-300">Rating</span>
                <select name="rating" defaultValue="5" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent">
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}★</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-300">Sort Order</span>
                <input name="sortOrder" type="number" defaultValue="0" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
              </label>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isPublished" defaultChecked className="rounded border-white/20 bg-slate-950/60 text-accent focus:ring-accent" />
              <span className="text-xs font-medium text-slate-300">Publish on homepage</span>
            </label>
            <button className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-accent/90">Add Testimonial</button>
          </form>
        </div>
      </div>
    </div>
  );
}
