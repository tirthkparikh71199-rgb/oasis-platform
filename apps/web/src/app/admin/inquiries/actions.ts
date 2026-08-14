"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function updateInquiryStatus(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "NEW");
  if (!id) redirect("/admin/inquiries");
  await db()
    .update(schema.inquiries)
    .set({ status: status as "NEW", updatedAt: sql`now()` })
    .where(eq(schema.inquiries.id, id));
  revalidatePath("/admin/inquiries");
  redirect("/admin/inquiries");
}
