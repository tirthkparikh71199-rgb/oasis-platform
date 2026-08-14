import { desc } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { createForm, deleteForm } from "./actions";

export const metadata = { title: "Forms | Oasis Impex Admin" };

export const dynamic = "force-dynamic";

export default async function AdminFormsPage({ searchParams }: { searchParams: Promise<{ created?: string; updated?: string }> }) {
  const user = await requireUser();
  requirePerm(user, "settings.read", "/admin");
  const { created, updated } = await searchParams;
  const forms = await db().select().from(schema.customForms).orderBy(desc(schema.customForms.createdAt));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Forms</h1>
          <p className="mt-1 text-sm text-slate-400">{forms.length} forms. Create custom forms for any purpose.</p>
        </div>
        <a href="#add-form" className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-slate-950">+ Form</a>
      </div>

      {created ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Form created.</p> : null}
      {updated ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Form updated.</p> : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {forms.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-slate-500">No forms yet.</p>
          ) : forms.map((f) => (
            <div key={f.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div>
                <p className="font-semibold text-slate-200">{f.name}</p>
                <p className="text-xs text-slate-500">/{f.slug} · {Array.isArray(f.fields) ? f.fields.length : 0} fields · {f.submitAction}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={`/admin/forms/${f.id}`} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:text-white">Edit</a>
                <span className={`rounded-full px-2 py-0.5 text-xs ${f.isPublished ? "bg-emerald-500/10 text-emerald-300" : "bg-slate-500/10 text-slate-400"}`}>{f.isPublished ? "Live" : "Draft"}</span>
                <form action={deleteForm}>
                  <input type="hidden" name="id" value={f.id} />
                  <button className="rounded-lg border border-red-500/20 px-2.5 py-1.5 text-xs text-red-300 hover:bg-red-500/10">Delete</button>
                </form>
              </div>
            </div>
          ))}
        </div>

        <div id="add-form" className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Create Form</h2>
          <form action={createForm} className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Form Name *</span>
              <input name="name" required placeholder="Contact Us" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Send submissions to</span>
              <input name="submitEmail" type="email" placeholder="sales@oasisimpex.in" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
            </label>
            <p className="text-xs text-slate-500">Default fields: Name, Email, Phone, Message. Edit after creation to customize.</p>
            <button className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-accent/90">Create Form</button>
          </form>
        </div>
      </div>
    </div>
  );
}
