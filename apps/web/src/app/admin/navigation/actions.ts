"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const str = (f: FormData, k: string) => (f.get(k) ? String(f.get(k)).trim() : null);
const num = (f: FormData, k: string) => { const v = f.get(k); return v ? Number(v) : null; };

export async function createNavItem(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "settings.write", "/admin/navigation");
  const label = str(formData, "label");
  const href = str(formData, "href");
  if (!label || !href) redirect("/admin/navigation?error=missing-fields");
  await db().insert(schema.navigationItems).values({
    label,
    href,
    parentId: str(formData, "parentId"),
    sortOrder: num(formData, "sortOrder") ?? 0,
    isPublished: formData.get("isPublished") === "on",
  });
  await logAudit({ actorUserId: user.id, action: "NAV_CREATED", entity: "navigation", metadata: { label, href } });
  revalidatePath("/admin/navigation");
  redirect("/admin/navigation?created=1");
}

export async function updateNavItem(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "settings.write", "/admin/navigation");
  const id = str(formData, "id");
  if (!id) redirect("/admin/navigation");
  await db().update(schema.navigationItems).set({
    label: str(formData, "label") ?? undefined,
    href: str(formData, "href") ?? undefined,
    sortOrder: num(formData, "sortOrder"),
    isPublished: formData.get("isPublished") === "on",
  }).where(eq(schema.navigationItems.id, id));
  await logAudit({ actorUserId: user.id, action: "NAV_UPDATED", entity: "navigation", entityId: id });
  revalidatePath("/admin/navigation");
  redirect("/admin/navigation?updated=1");
}

export async function deleteNavItem(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "settings.manage", "/admin/navigation");
  const id = str(formData, "id");
  if (id) {
    await db().delete(schema.navigationItems).where(eq(schema.navigationItems.id, id));
    await logAudit({ actorUserId: user.id, action: "NAV_DELETED", entity: "navigation", entityId: id });
  }
  revalidatePath("/admin/navigation");
  redirect("/admin/navigation");
}

export async function reorderNav(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "settings.write", "/admin/navigation");
  const ids = formData.getAll("ids");
  for (let i = 0; i < ids.length; i++) {
    await db().update(schema.navigationItems).set({ sortOrder: i }).where(eq(schema.navigationItems.id, String(ids[i])));
  }
  revalidatePath("/admin/navigation");
  redirect("/admin/navigation?updated=1");
}
