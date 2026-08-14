import { desc, sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { createRole, deleteRole } from "./actions";
import { PERMISSION_GROUPS } from "./permissions";

export const metadata = { title: "Roles & Permissions | Oasis Impex Admin" };

export const dynamic = "force-dynamic";

export default async function AdminRolesPage({ searchParams }: { searchParams: Promise<{ created?: string; error?: string; deleted?: string }> }) {
  const user = await requireUser();
  requirePerm(user, "roles.manage", "/admin/users");
  const { created, error, deleted } = await searchParams;

  const rows = await db()
    .select({
      id: schema.roles.id,
      name: schema.roles.name,
      description: schema.roles.description,
      users: sql<number>`(select count(*)::int from ${schema.userRoles} ur where ur.role_id = ${schema.roles.id})`,
      perms: sql<number>`(select count(*)::int from ${schema.rolePermissions} rp where rp.role_id = ${schema.roles.id})`,
    })
    .from(schema.roles)
    .orderBy(desc(sql`name = 'SUPER_ADMIN'`), desc(sql`name = 'ADMIN'`), sql`name`);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Roles &amp; permissions</h1>
      {created ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Role created.</p> : null}
      {deleted ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Role deleted.</p> : null}
      {error === "exists" ? <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">A role with that name already exists.</p> : null}
      {error === "in-use" ? <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">Role is assigned to a user — reassign them before deleting.</p> : null}
      {error === "system-role" ? <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">Built-in roles can&apos;t be deleted.</p> : null}
      <p className="mt-1 text-sm text-slate-400">Create custom roles, tick exactly which modules each role can access, and assign them from Team &amp; Roles.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Members</th>
                <th className="px-4 py-3">Permissions</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <a href={`/admin/roles/${r.id}`} className="font-semibold text-slate-200 hover:text-accent">
                      {r.name}
                    </a>
                    <p className="mt-0.5 text-xs text-slate-500">{r.description}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{r.users}</td>
                  <td className="px-4 py-3 text-slate-400">{r.perms} codes</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a href={`/admin/roles/${r.id}`} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white">
                        Edit
                      </a>
                      <form action={deleteRole}>
                        <input type="hidden" name="id" value={r.id} />
                        <button className="rounded-lg border border-red-500/20 px-2.5 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/10">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form action={createRole} className="h-fit rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Create custom role</h2>
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Role name *</span>
              <input name="name" required placeholder="e.g. Operations Manager" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Description</span>
              <input name="description" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
            </label>
            <div className="max-h-72 space-y-3 overflow-y-auto rounded-lg border border-white/10 bg-slate-950/40 p-3">
              {PERMISSION_GROUPS.map((g) => (
                <fieldset key={g.key}>
                  <legend className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{g.label}</legend>
                  <div className="mt-1 space-y-1">
                    {g.perms.map((p) => (
                      <label key={p.code} className="flex items-center gap-2 text-xs text-slate-300">
                        <input type="checkbox" name={`perm::${p.code}`} className="accent-accent" />
                        {p.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
            <button type="submit" className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-accent/90">
              Create role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
