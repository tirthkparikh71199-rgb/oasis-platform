import { desc, sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { createUser, resetPassword, toggleUserActive, updateUserRole } from "./actions";

export const metadata = { title: "Team | Oasis Impex Admin" };

export const dynamic = "force-dynamic";

const ROLE_OPTIONS = ["ADMIN", "SALES", "ANALYST", "INVENTORY_MANAGER", "KNOWLEDGE_MANAGER", "AGENT", "VIEWER"];

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  const user = await requireUser();
  requirePerm(user, "users.read", "/admin");
  const { created } = await searchParams;

  const rows = await db()
    .select({
      user: schema.users,
      roleName: schema.roles.name,
      roleDescription: schema.roles.description,
    })
    .from(schema.users)
    .leftJoin(schema.userRoles, sql`${schema.userRoles.userId} = ${schema.users.id}`)
    .leftJoin(schema.roles, sql`${schema.roles.id} = ${schema.userRoles.roleId}`)
    .orderBy(desc(schema.users.createdAt));

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Team &amp; roles</h1>
      {created ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">User created. They can sign in at /login.</p> : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last login</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((r) => (
                <tr key={r.user.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-semibold text-slate-200">
                    {r.user.name}
                    {r.user.id === user.id ? <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-300">you</span> : null}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{r.user.email}</td>
                  <td className="px-4 py-3">
                    <form action={updateUserRole} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={r.user.id} />
                      <select
                        name="role"
                        defaultValue={r.roleName ?? "VIEWER"}
                        className="rounded-lg border border-white/10 bg-slate-950/60 px-2 py-1.5 text-xs text-white outline-none focus:border-accent"
                      >
                        {ROLE_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="rounded border border-white/10 px-2 py-1.5 text-xs text-slate-300 hover:text-white">
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.user.isActive ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>
                      {r.user.isActive ? "ACTIVE" : "DISABLED"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{r.user.lastLoginAt ? r.user.lastLoginAt.toLocaleDateString("en-IN") : "Never"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <form action={resetPassword}>
                        <input type="hidden" name="userId" value={r.user.id} />
                        <button className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white">Reset pwd</button>
                      </form>
                      <form action={toggleUserActive}>
                        <input type="hidden" name="userId" value={r.user.id} />
                        <button className="rounded-lg border border-amber-500/20 px-2.5 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/10">
                          {r.user.isActive ? "Disable" : "Enable"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form action={createUser} className="h-fit rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Add team member</h2>
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Name *</span>
              <input name="name" required className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Email *</span>
              <input name="email" type="email" required className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Phone</span>
              <input name="phone" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Password *</span>
              <input name="password" type="password" required minLength={8} className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Role *</span>
              <select name="role" defaultValue="ANALYST" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent">
                {ROLE_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-accent/90">
              Create user
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
