import { asc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { createReminder, deleteReminder, toggleReminder } from "./actions";

export const metadata = { title: "Follow-ups & Tasks | Oasis Impex Admin" };

export const dynamic = "force-dynamic";

export default async function AdminRemindersPage({ searchParams }: { searchParams: Promise<{ inquiry?: string; title?: string; created?: string; error?: string }> }) {
  const user = await requireUser();
  requirePerm(user, "leads.read", "/admin");
  const { inquiry, title, created, error } = await searchParams;

  const assignee = alias(schema.users, "assignee");

  const rows = await db()
    .select({
      id: schema.reminders.id,
      title: schema.reminders.title,
      dueAt: schema.reminders.dueAt,
      done: schema.reminders.done,
      doneAt: schema.reminders.doneAt,
      entity: schema.reminders.entity,
      entityId: schema.reminders.entityId,
      assigned: assignee.name,
    })
    .from(schema.reminders)
    .leftJoin(assignee, eq(schema.reminders.assignedTo, assignee.id))
    .orderBy(asc(schema.reminders.done), asc(schema.reminders.dueAt));

  const now = Date.now();
  const open = rows.filter((r) => !r.done);
  const overdue = open.filter((r) => r.dueAt.getTime() < now);

  const team = await db().select({ id: schema.users.id, name: schema.users.name }).from(schema.users).orderBy(asc(schema.users.name));
  const nextHour = new Date(now + 3600_000).toISOString().slice(0, 16);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Follow-ups & tasks</h1>
      <p className="mt-1 text-sm text-slate-400">
        {open.length} open{overdue.length > 0 ? ` · ${overdue.length} overdue` : ""}. Due items appear in the daily brief and alert emails.
      </p>
      {created ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Reminder created.</p> : null}
      {error === "missing-fields" ? <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">Title and due time are required.</p> : null}

      <form action={createReminder} className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">New follow-up</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-slate-300">Task *</span>
            <input
              name="title"
              required
              defaultValue={inquiry ? `${title ?? "Follow up"} — #${inquiry.slice(0, 8)}` : ""}
              placeholder="e.g. Call back about PVC resin quote"
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-300">Due *</span>
            <input name="dueAt" type="datetime-local" required defaultValue={nextHour} className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-300">Assign to</span>
            <select name="assignedTo" defaultValue={user.id} className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent">
              {team.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        {inquiry ? (
          <p className="mt-3 text-xs text-slate-500">
            Linked to inquiry <span className="text-accent">#{inquiry.slice(0, 8)}</span>.
          </p>
        ) : null}
        <input type="hidden" name="entity" value={inquiry ? "inquiry" : ""} />
        <input type="hidden" name="entityId" value={inquiry ?? ""} />
        <button type="submit" className="mt-4 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-accent/90">
          Add reminder
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {rows.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-slate-500">No follow-ups yet. Add one above or from any inquiry.</p>
        ) : (
          rows.map((r) => (
            <div key={r.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 ${r.done ? "opacity-50" : overdue ? "border-red-500/30" : ""}`}>
              <div className="min-w-0">
                <p className={`text-sm font-semibold text-slate-100 ${r.done ? "line-through" : ""}`}>{r.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Due {new Date(r.dueAt).toLocaleString("en-IN")}
                  {r.doneAt ? ` · done ${new Date(r.doneAt).toLocaleString("en-IN")}` : ""}
                  {r.assigned ? ` · ${r.assigned}` : ""}
                  {r.entity === "inquiry" ? (
                    <a href={`/admin/inquiries?inquiry=${r.entityId}`} className="ml-1 text-accent hover:underline">
                      inquiry #{r.entityId?.slice(0, 8)}
                    </a>
                  ) : null}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <form action={toggleReminder}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${r.done ? "border-white/10 text-slate-300 hover:text-white" : "border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/10"}`}>
                    {r.done ? "Reopen" : "Mark done"}
                  </button>
                </form>
                <form action={deleteReminder}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10">Delete</button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
