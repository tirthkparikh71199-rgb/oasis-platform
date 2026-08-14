import { desc, eq, gte, sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";

export const metadata = { title: "Audit Log | Oasis Impex Admin" };

export const dynamic = "force-dynamic";

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<{ entity?: string; action?: string }> }) {
  const user = await requireUser();
  requirePerm(user, "settings.read", "/admin");
  const { entity, action } = await searchParams;

  const conditions = [gte(schema.auditLogs.createdAt, sql`now() - interval '14 days'`)];
  if (entity) conditions.push(eq(schema.auditLogs.entity, entity));
  if (action) conditions.push(eq(schema.auditLogs.action, action));

  const rows = await db()
    .select({
      id: schema.auditLogs.id,
      action: schema.auditLogs.action,
      actorType: schema.auditLogs.actorType,
      entity: schema.auditLogs.entity,
      entityId: schema.auditLogs.entityId,
      metadata: schema.auditLogs.metadata,
      createdAt: schema.auditLogs.createdAt,
      actor: schema.users.name,
    })
    .from(schema.auditLogs)
    .leftJoin(schema.users, eq(schema.auditLogs.actorUserId, schema.users.id))
    .where(sql`${schema.auditLogs.createdAt} >= now() - interval '14 days'`)
    .orderBy(desc(schema.auditLogs.createdAt))
    .limit(500);

  const distinctEntities = [...new Set(rows.map((r) => r.entity).filter(Boolean))];
  const distinctActions = [...new Set(rows.map((r) => r.action))];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Audit log</h1>
        <div className="flex items-center gap-2">
          <form className="flex flex-wrap items-center gap-2">
            <select name="entity" defaultValue={entity ?? ""} className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-white outline-none focus:border-accent">
              <option value="">All entities</option>
              {distinctEntities.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
            <select name="action" defaultValue={action ?? ""} className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-white outline-none focus:border-accent">
              <option value="">All actions</option>
              {distinctActions.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
            <button className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:text-white">Filter</button>
          </form>
          <a href="/api/audit/export" className="rounded-lg bg-accent px-3 py-2 text-xs font-bold text-slate-950 hover:bg-accent/90">
            Export CSV
          </a>
        </div>
      </div>
      <p className="mt-1 text-sm text-slate-400">Last 14 days, up to 500 entries. Every meaningful action on the platform is recorded here.</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No audit entries yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.02]">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{new Date(r.createdAt).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <span className="text-slate-300">{r.actor ?? r.actorType}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium text-accent">{r.action}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {r.entity ?? "—"}
                    {r.entityId ? <span className="block text-slate-600">#{r.entityId.slice(0, 8)}</span> : null}
                  </td>
                  <td className="max-w-[280px] px-4 py-3 text-xs text-slate-500">{r.metadata ? JSON.stringify(r.metadata).slice(0, 160) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
