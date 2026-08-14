import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "./db";
import type { SessionUser } from "./rbac";
import { hasPermission } from "./rbac";

export const SESSION_COOKIE = "oasis_session";
export const SESSION_DAYS = 14;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export type { SessionUser };

export async function createSession(userId: string, ip?: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db().insert(schema.sessions).values({ userId, tokenHash: hashToken(token), expiresAt, ip });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const dbs = db();
  const rows = await dbs
    .select({
      userId: schema.sessions.userId,
      email: schema.users.email,
      name: schema.users.name,
      isActive: schema.users.isActive,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(and(eq(schema.sessions.tokenHash, hashToken(token)), gt(schema.sessions.expiresAt, new Date()), isNull(schema.sessions.revokedAt)))
    .limit(1);
  if (rows.length === 0) return null;
  const u = rows[0];
  if (!u.isActive) return null;

  const roles = await dbs
    .select({ id: schema.roles.id, name: schema.roles.name })
    .from(schema.userRoles)
    .innerJoin(schema.roles, eq(schema.userRoles.roleId, schema.roles.id))
    .where(eq(schema.userRoles.userId, u.userId));

  const roleNames = roles.map((r) => r.name);
  const roleIds = roles.map((r) => r.id);
  const perms = roleIds.length
    ? await dbs
        .select({ code: schema.permissions.code })
        .from(schema.rolePermissions)
        .innerJoin(schema.permissions, eq(schema.rolePermissions.permissionId, schema.permissions.id))
        .where(
          sql`${schema.rolePermissions.roleId} = ANY(${roleIds}::uuid[])`,
        )
    : [];


  return { id: u.userId, email: u.email, name: u.name, roles: roleNames, permissions: perms.map((p) => p.code) };
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db().update(schema.sessions).set({ revokedAt: new Date() }).where(eq(schema.sessions.tokenHash, hashToken(token)));
  }
  cookieStore.delete(SESSION_COOKIE);
}

export { hasPermission } from "./rbac";

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export function requirePerm(user: SessionUser, permission: string, fallback = "/admin"): void {
  if (!hasPermission(user, permission)) redirect(`${fallback}?error=no-permission`);
}
