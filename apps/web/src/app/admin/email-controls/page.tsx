import { desc, eq, sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { addBlock, removeBlock } from "./actions";

export const metadata = { title: "Email Controls | Oasis Impex Admin" };

export const dynamic = "force-dynamic";

export default async function EmailControlsPage() {
  const user = await requireUser();
  requirePerm(user, "campaigns.read", "/admin");

  const [subscribers, blockedEmails, blockedDomains, stats] = await Promise.all([
    db().select().from(schema.subscribers).orderBy(desc(schema.subscribers.createdAt)).limit(200),
    db().select().from(schema.emailBlocks).where(eq(schema.emailBlocks.kind, "EMAIL")).orderBy(desc(schema.emailBlocks.createdAt)),
    db().select().from(schema.emailBlocks).where(eq(schema.emailBlocks.kind, "DOMAIN")).orderBy(desc(schema.emailBlocks.createdAt)),
    db().select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where unsubscribed = false)::int`,
      unsubscribed: sql<number>`count(*) filter (where unsubscribed = true)::int`,
    }).from(schema.subscribers),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Email controls</h1>
      <p className="mt-1 text-sm text-slate-400">Manage subscribers, block fake/disposable addresses, and control who receives campaigns.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Subscriber Stats</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total</span>
              <span className="font-bold text-white">{stats[0]?.total ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Active</span>
              <span className="font-bold text-emerald-300">{stats[0]?.active ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Unsubscribed</span>
              <span className="font-bold text-red-300">{stats[0]?.unsubscribed ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Blocked Emails ({blockedEmails.length})</h2>
          <form action={addBlock} className="mt-4 flex gap-2">
            <input type="hidden" name="kind" value="EMAIL" />
            <input name="value" placeholder="spam@example.com" required className="flex-1 rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-accent" />
            <button className="rounded-lg bg-red-500/20 px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-500/30">Block</button>
          </form>
          <div className="mt-3 max-h-40 overflow-y-auto space-y-1">
            {blockedEmails.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg bg-slate-950/40 px-2.5 py-1.5 text-xs">
                <span className="text-slate-300">{b.value}</span>
                <form action={removeBlock}>
                  <input type="hidden" name="id" value={b.id} />
                  <button className="text-red-400 hover:text-red-300">Remove</button>
                </form>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Blocked Domains ({blockedDomains.length})</h2>
          <form action={addBlock} className="mt-4 flex gap-2">
            <input type="hidden" name="kind" value="DOMAIN" />
            <input name="value" placeholder="spamdomain.com" required className="flex-1 rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-accent" />
            <button className="rounded-lg bg-red-500/20 px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-500/30">Block</button>
          </form>
          <div className="mt-3 max-h-40 overflow-y-auto space-y-1">
            {blockedDomains.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg bg-slate-950/40 px-2.5 py-1.5 text-xs">
                <span className="text-slate-300">{b.value}</span>
                <form action={removeBlock}>
                  <input type="hidden" name="id" value={b.id} />
                  <button className="text-red-400 hover:text-red-300">Remove</button>
                </form>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Subscribers ({subscribers.length})</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {subscribers.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No subscribers yet.</td></tr>
              ) : subscribers.map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-slate-300">{s.email ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-400">{s.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{s.source}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.unsubscribed ? "bg-red-500/10 text-red-300" : "bg-emerald-500/10 text-emerald-300"}`}>
                      {s.unsubscribed ? "Unsubscribed" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{new Date(s.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
