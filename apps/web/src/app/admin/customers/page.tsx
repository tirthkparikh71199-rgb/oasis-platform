import Link from "next/link";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { deleteCustomer, importCustomers } from "./actions";
import { CustomerForm } from "./customer-form";
import { CustomerProfile } from "./customer-profile";

export const metadata = { title: "Customers | Oasis Impex Admin" };

const STATUS_STYLES: Record<string, string> = {
  LEAD: "bg-amber-500/10 text-amber-300",
  ACTIVE: "bg-emerald-500/10 text-emerald-300",
  INACTIVE: "bg-slate-500/10 text-slate-400",
};

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ edit?: string; email?: string; add?: string; imported?: string; import?: string }> }) {
  const { edit, email, add, imported, import: importErr } = await searchParams;
  const customers = await db().select().from(schema.customers).orderBy(schema.customers.createdAt);
  const editing = edit ? customers.find((c) => c.id === edit) : undefined;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Customers</h1>
        <div className="flex items-center gap-2">
          <form action={importCustomers} className="flex items-center gap-2">
            <input type="file" name="file" accept=".csv,text/csv" className="max-w-[180px] text-xs text-slate-400 file:mr-2 file:rounded-lg file:border file:border-white/10 file:bg-white/5 file:px-2.5 file:py-1.5 file:text-xs file:text-slate-300" />
            <button className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white">Import CSV</button>
          </form>
          <a href="/api/customers/export" className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white">
            Export CSV
          </a>
        </div>
      </div>
      {imported ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Imported {imported} customer(s).</p> : null}
      {importErr ? <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">Could not import — check the CSV has a "name" column and at least one row.</p> : null}

      {email ? <div className="mt-5"><CustomerProfile email={email} /></div> : null}

      <div className={email ? "mt-5 grid gap-6 lg:grid-cols-[1fr_360px]" : "mt-6 grid gap-6 lg:grid-cols-[1fr_360px]"}>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No customers yet. Add your first below.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-semibold text-slate-200">{c.name}</td>
                    <td className="px-4 py-3 text-slate-400">{c.company ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {c.email ?? "—"}
                      {c.phone ? <span className="block text-xs text-slate-500">{c.phone}</span> : null}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{c.location ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[c.status]}`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/customers?edit=${c.id}`}
                          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white"
                        >
                          Edit
                        </Link>
                        <form action={deleteCustomer}>
                          <input type="hidden" name="id" value={c.id} />
                          <button className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300">
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
        <CustomerForm customer={editing ?? (add && email ? { email } : undefined)} />
      </div>
    </div>
  );
}
