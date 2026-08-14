"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const str = (f: FormData, k: string) => (f.get(k) ? String(f.get(k)).trim() : null);

export async function createForm(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "settings.write", "/admin/forms");
  const name = str(formData, "name");
  if (!name) redirect("/admin/forms?error=missing-name");
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const fields = [
    { name: "name", type: "text", label: "Name", required: true },
    { name: "email", type: "email", label: "Email", required: true },
    { name: "phone", type: "tel", label: "Phone", required: false },
    { name: "message", type: "textarea", label: "Message", required: true },
  ];
  const [created] = await db().insert(schema.customForms).values({
    name,
    slug,
    fields,
    submitEmail: str(formData, "submitEmail"),
    isPublished: true,
  }).returning({ id: schema.customForms.id });
  await logAudit({ actorUserId: user.id, action: "FORM_CREATED", entity: "custom_forms", entityId: created.id, metadata: { name, slug } });
  revalidatePath("/admin/forms");
  redirect(`/admin/forms/${created.id}?created=1`);
}

export async function updateForm(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "settings.write", "/admin/forms");
  const id = str(formData, "id");
  if (!id) redirect("/admin/forms");
  const fieldsJson = str(formData, "fields");
  const fields = fieldsJson ? JSON.parse(fieldsJson) : undefined;
  await db().update(schema.customForms).set({
    name: str(formData, "name") ?? undefined,
    submitEmail: str(formData, "submitEmail"),
    submitWebhook: str(formData, "submitWebhook"),
    isPublished: formData.get("isPublished") === "on",
    fields,
    updatedAt: sql`now()`,
  }).where(eq(schema.customForms.id, id));
  await logAudit({ actorUserId: user.id, action: "FORM_UPDATED", entity: "custom_forms", entityId: id });
  revalidatePath("/admin/forms");
  redirect(`/admin/forms/${id}?updated=1`);
}

export async function deleteForm(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "settings.manage", "/admin/forms");
  const id = str(formData, "id");
  if (id) {
    await db().delete(schema.customForms).where(eq(schema.customForms.id, id));
    await logAudit({ actorUserId: user.id, action: "FORM_DELETED", entity: "custom_forms", entityId: id });
  }
  revalidatePath("/admin/forms");
  redirect("/admin/forms");
}
