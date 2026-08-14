"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { hash } from "argon2";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";

const str = (f: FormData, k: string) => (f.get(k) ? String(f.get(k)).trim() : null);

export async function createUser(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "users.write", "/admin/users");
  const name = str(formData, "name");
  const email = str(formData, "email")?.toLowerCase();
  const password = str(formData, "password");
  const roleName = str(formData, "role");
  if (!name || !email || !password || !roleName) redirect("/admin/users?error=missing-fields");

  const passwordHash = await hash(password);
  const inserted = await db()
    .insert(schema.users)
    .values({ name, email, passwordHash, phone: str(formData, "phone") })
    .onConflictDoNothing({ target: schema.users.email })
    .returning({ id: schema.users.id });
  if (inserted.length === 0) redirect("/admin/users?error=email-exists");

  const role = await db()
    .select({ id: schema.roles.id })
    .from(schema.roles)
    .where(eq(schema.roles.name, roleName as never))
    .limit(1);
  if (role[0]) {
    await db().insert(schema.userRoles).values({ userId: inserted[0].id, roleId: role[0].id }).onConflictDoNothing();
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?created=1");
}

export async function updateUserRole(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "users.write", "/admin/users");
  const userId = str(formData, "userId");
  const roleName = str(formData, "role");
  if (!userId || !roleName) redirect("/admin/users");
  await db().delete(schema.userRoles).where(eq(schema.userRoles.userId, userId));
  const role = await db().select({ id: schema.roles.id }).from(schema.roles).where(eq(schema.roles.name, roleName as never)).limit(1);
  if (role[0]) await db().insert(schema.userRoles).values({ userId, roleId: role[0].id }).onConflictDoNothing();
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function resetPassword(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "users.write", "/admin/users");
  const userId = str(formData, "userId");
  const password = str(formData, "password");
  if (!userId || !password) redirect("/admin/users");
  await db().update(schema.users).set({ passwordHash: await hash(password) }).where(eq(schema.users.id, userId));
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function toggleUserActive(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "users.write", "/admin/users");
  const userId = str(formData, "userId");
  if (!userId || userId === user.id) redirect("/admin/users?error=cannot-deactivate-self");
  const target = await db().select({ isActive: schema.users.isActive }).from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  if (target[0]) {
    await db().update(schema.users).set({ isActive: !target[0].isActive }).where(eq(schema.users.id, userId));
  }
  revalidatePath("/admin/users");
  redirect("/admin/users");
}
