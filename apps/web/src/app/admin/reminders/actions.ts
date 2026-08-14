"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const str = (f: FormData, k: string) => (f.get(k) ? String(f.get(k)).trim() : null);

export async function createReminder(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "leads.write", "/admin/reminders");
  const title = str(formData, "title");
  const dueAt = str(formData, "dueAt");
  if (!title || !dueAt) redirect("/admin/reminders?error=missing-fields");
  const entity = str(formData, "entity");
  const entityId = str(formData, "entityId");
  const assignedTo = str(formData, "assignedTo");

  await db().insert(schema.reminders).values({
    title,
    dueAt: new Date(dueAt),
    entity: entity ?? undefined,
    entityId: entityId ?? undefined,
    assignedTo: assignedTo ?? undefined,
    createdBy: user.id,
  });
  await logAudit({ actorUserId: user.id, action: "REMINDER_CREATED", entity: entity ?? "reminders", entityId: entityId ?? undefined, metadata: { title } });
  revalidatePath("/admin/reminders");
  redirect("/admin/reminders?created=1");
}

export async function toggleReminder(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "leads.write", "/admin/reminders");
  const id = str(formData, "id");
  if (!id) redirect("/admin/reminders");
  const row = await db().select({ done: schema.reminders.done }).from(schema.reminders).where(eq(schema.reminders.id, id)).limit(1);
  if (!row[0]) redirect("/admin/reminders");
  const nowDone = !row[0].done;
  await db()
    .update(schema.reminders)
    .set({ done: nowDone, doneAt: nowDone ? new Date() : null, updatedAt: sql`now()` })
    .where(eq(schema.reminders.id, id));
  await logAudit({ actorUserId: user.id, action: nowDone ? "REMINDER_DONE" : "REMINDER_REOPENED", entity: "reminders", entityId: id });
  revalidatePath("/admin/reminders");
  redirect("/admin/reminders");
}

export async function deleteReminder(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "leads.write", "/admin/reminders");
  const id = str(formData, "id");
  if (id) {
    await db().delete(schema.reminders).where(eq(schema.reminders.id, id));
    await logAudit({ actorUserId: user.id, action: "REMINDER_DELETED", entity: "reminders", entityId: id });
  }
  revalidatePath("/admin/reminders");
  redirect("/admin/reminders");
}
