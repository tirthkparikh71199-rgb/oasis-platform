"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const str = (f: FormData, k: string) => (f.get(k) ? String(f.get(k)).trim() : null);
const num = (f: FormData, k: string) => { const v = f.get(k); return v ? Number(v) : null; };

export async function createPage(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "settings.write", "/admin/pages");
  const title = str(formData, "title");
  if (!title) redirect("/admin/pages?error=missing-title");
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const [created] = await db().insert(schema.dynamicPages).values({
    title,
    slug,
    metaTitle: str(formData, "metaTitle"),
    metaDescription: str(formData, "metaDescription"),
    content: { blocks: [] },
    isPublished: true,
  }).returning({ id: schema.dynamicPages.id });
  await logAudit({ actorUserId: user.id, action: "PAGE_CREATED", entity: "dynamic_pages", entityId: created.id, metadata: { title, slug } });
  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${created.id}?created=1`);
}

export async function updatePage(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "settings.write", "/admin/pages");
  const id = str(formData, "id");
  if (!id) redirect("/admin/pages");
  const contentJson = str(formData, "content");
  const content = contentJson ? JSON.parse(contentJson) : undefined;
  await db().update(schema.dynamicPages).set({
    title: str(formData, "title") ?? undefined,
    metaTitle: str(formData, "metaTitle"),
    metaDescription: str(formData, "metaDescription"),
    isPublished: formData.get("isPublished") === "on",
    sortOrder: num(formData, "sortOrder"),
    content,
    updatedAt: sql`now()`,
  }).where(eq(schema.dynamicPages.id, id));
  await logAudit({ actorUserId: user.id, action: "PAGE_UPDATED", entity: "dynamic_pages", entityId: id });
  revalidatePath("/admin/pages");
  revalidatePath(`/${str(formData, "slug")}`);
  redirect(`/admin/pages/${id}?updated=1`);
}

export async function deletePage(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "settings.manage", "/admin/pages");
  const id = str(formData, "id");
  if (id) {
    await db().delete(schema.dynamicPages).where(eq(schema.dynamicPages.id, id));
    await logAudit({ actorUserId: user.id, action: "PAGE_DELETED", entity: "dynamic_pages", entityId: id });
  }
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}
