"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";

const str = (f: FormData, k: string) => (f.get(k) ? String(f.get(k)).trim() : null);

const SYSTEM_ROLES = ["SUPER_ADMIN", "ADMIN", "SALES", "ANALYST", "INVENTORY_MANAGER", "KNOWLEDGE_MANAGER", "AGENT", "VIEWER"];

function permCodes(f: FormData, prefix: string): string[] {
  return [...f.keys()].filter((k) => k.startsWith(`${prefix}::`)).map((k) => k.slice(prefix.length + 2));
}

export async function createRole(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "roles.manage", "/admin/roles");
  const name = str(formData, "name");
  const description = str(formData, "description");
  if (!name) redirect("/admin/roles?error=missing-name");
  const codes = permCodes(formData, "perm");

  const role = await db()
    .insert(schema.roles)
    .values({ name: name.toUpperCase().replace(/\s+/g, "_"), description })
    .onConflictDoNothing({ target: schema.roles.name })
    .returning({ id: schema.roles.id });
  if (role.length === 0) redirect("/admin/roles?error=exists");

  await setPermissions(role[0].id, codes);
  revalidatePath("/admin/roles");
  redirect("/admin/roles?created=1");
}

export async function updateRole(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "roles.manage", "/admin/roles");
  const id = str(formData, "id");
  if (!id) redirect("/admin/roles");
  const description = str(formData, "description");
  const newName = str(formData, "name");
  const existing = await db().select({ name: schema.roles.name }).from(schema.roles).where(eq(schema.roles.id, id)).limit(1);
  if (!existing[0]) redirect("/admin/roles");

  const isSystem = SYSTEM_ROLES.includes(existing[0].name);
  await db()
    .update(schema.roles)
    .set({
      name: isSystem ? existing[0].name : (newName ?? existing[0].name).toUpperCase().replace(/\s+/g, "_"),
      description: description || undefined,
    })
    .where(eq(schema.roles.id, id));

  const codes = permCodes(formData, "perm");
  await setPermissions(id, codes);
  revalidatePath("/admin/roles");
  redirect(`/admin/roles/${id}?saved=1`);
}

export async function deleteRole(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "roles.manage", "/admin/roles");
  const id = str(formData, "id");
  if (!id) redirect("/admin/roles");
  const existing = await db().select({ name: schema.roles.name }).from(schema.roles).where(eq(schema.roles.id, id)).limit(1);
  if (!existing[0]) redirect("/admin/roles");
  if (SYSTEM_ROLES.includes(existing[0].name)) redirect("/admin/roles?error=system-role");
  const used = await db().select({ n: sql<number>`count(*)::int` }).from(schema.userRoles).where(eq(schema.userRoles.roleId, id));
  if ((used[0]?.n ?? 0) > 0) redirect("/admin/roles?error=in-use");
  await db().delete(schema.roles).where(eq(schema.roles.id, id));
  revalidatePath("/admin/roles");
  redirect("/admin/roles?deleted=1");
}

async function setPermissions(roleId: string, codes: string[]) {
  await db().delete(schema.rolePermissions).where(eq(schema.rolePermissions.roleId, roleId));
  if (codes.length === 0) return;
  const perms = await db().select({ id: schema.permissions.id, code: schema.permissions.code }).from(schema.permissions);
  const byCode = new Map(perms.map((p) => [p.code, p.id]));
  const rows = codes.filter((c) => byCode.has(c)).map((c) => ({ roleId, permissionId: byCode.get(c)! }));
  if (rows.length) await db().insert(schema.rolePermissions).values(rows).onConflictDoNothing();
}
