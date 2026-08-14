import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { updateRole } from "../actions";
import { RolePermissionMatrix } from "../role-permission-matrix";

export const metadata = { title: "Edit Role | Oasis Impex Admin" };

export const dynamic = "force-dynamic";

const SYSTEM_ROLES = ["SUPER_ADMIN", "ADMIN", "SALES", "ANALYST", "INVENTORY_MANAGER", "KNOWLEDGE_MANAGER", "AGENT", "VIEWER"];

export default async function AdminRoleEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const user = await requireUser();
  requirePerm(user, "roles.manage", "/admin/roles");
  const { id } = await params;
  const { saved } = await searchParams;

  const [role] = await db()
    .select({
      id: schema.roles.id,
      name: schema.roles.name,
      description: schema.roles.description,
    })
    .from(schema.roles)
    .where(eq(schema.roles.id, id))
    .limit(1);
  if (!role) notFound();

  const permRows = await db()
    .select({ code: schema.permissions.code })
    .from(schema.rolePermissions)
    .innerJoin(schema.permissions, eq(schema.rolePermissions.permissionId, schema.permissions.id))
    .where(eq(schema.rolePermissions.roleId, id));

  const isSystem = SYSTEM_ROLES.includes(role.name);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">
        Role: <span className="text-accent">{role.name}</span>
        {isSystem ? <span className="ml-2 rounded bg-white/10 px-2 py-0.5 text-[11px] text-slate-400">Built-in</span> : null}
      </h1>
      {saved ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Permissions saved.</p> : null}
      <p className="mt-1 text-sm text-slate-400">Tick exactly what this role can access. Super Admin always has full access regardless.</p>

      <form action={updateRole} className="mt-6">
        <input type="hidden" name="id" value={role.id} />
        <RolePermissionMatrix initial={permRows.map((p) => p.code)} name={role.name} description={role.description} system={isSystem} />
      </form>
    </div>
  );
}
