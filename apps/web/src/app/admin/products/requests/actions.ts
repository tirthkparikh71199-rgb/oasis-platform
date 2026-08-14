"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";

const str = (f: FormData, k: string) => (f.get(k) ? String(f.get(k)).trim() : null);

const STATUSES = ["NEW", "QUOTING", "ORDERED", "AVAILABLE", "DECLINED"];

export async function updateRequestStatus(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "requests.write", "/admin/products/requests");
  const id = str(formData, "id");
  const status = str(formData, "status");
  const notes = str(formData, "notes");
  if (!id || !status) redirect("/admin/products/requests");
  if (!STATUSES.includes(status)) redirect("/admin/products/requests?error=bad-status");
  await db()
    .update(schema.productRequests)
    .set({ status: status as never, notes: notes || undefined, updatedAt: sql`now()` })
    .where(eq(schema.productRequests.id, id));
  revalidatePath("/admin/products/requests");
  redirect("/admin/products/requests?saved=1");
}

export async function deleteRequest(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "requests.write", "/admin/products/requests");
  const id = str(formData, "id");
  if (id) await db().delete(schema.productRequests).where(eq(schema.productRequests.id, id));
  revalidatePath("/admin/products/requests");
  redirect("/admin/products/requests");
}
