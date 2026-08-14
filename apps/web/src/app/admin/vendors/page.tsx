import { desc } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { createVendor, deleteVendor } from "./actions";

export const metadata = { title: "Vendors | Oasis Impex Admin" };

export const dynamic = "force-dynamic";

export default async function AdminVendorsPage({ searchParams }: { searchParams: Promise<{ created?: string; updated?: string; error?: string }> }) {
  const user = await requireUser();
  requirePerm(user, "partners.read", "/admin");
  const { created, updated } = await searchParams;

  const vendors = await db().select().from(schema.vendors).orderBy(desc(schema.vendors.createdAt));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Vendors</h1>
          <p className="mt-1 text-sm text-slate-400">{vendors.length} vendors. Manage your supplier relationships.</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/vendors" target="_blank" className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:text-white">View Public Page</a>
          <a href="#add-vendor" className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-slate-950">+ Vendor</a>
        </div>
      </div>

      {created ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Vendor created.</p> : null}
      {updated ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Vendor updated.</p> : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {vendors.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No vendors yet.</td></tr>
              ) : vendors.map((v) => (
                <tr key={v.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-semibold text-slate-200">{v.name}</td>
                  <td className="px-4 py-3 text-slate-400">{v.company ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-400">{v.country ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-400">{v.contactName ?? "—"} {v.phone ? `(${v.phone})` : ""}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${v.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-300" : "bg-slate-500/10 text-slate-400"}`}>{v.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <form action={deleteVendor}>
                        <input type="hidden" name="id" value={v.id} />
                        <button className="rounded-lg border border-red-500/20 px-2.5 py-1.5 text-xs text-red-300 hover:bg-red-500/10">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div id="add-vendor" className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Add Vendor</h2>
          <form action={createVendor} className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Name *</span>
              <input name="name" required className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Company</span>
              <input name="company" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Country</span>
              <input name="country" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Contact Name</span>
              <input name="contactName" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-slate-300">Email</span>
                <input name="email" type="email" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-300">Phone</span>
                <input name="phone" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
              </label>
            </div>
            <button className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-accent/90">Add Vendor</button>
          </form>
        </div>
      </div>
    </div>
  );
}
