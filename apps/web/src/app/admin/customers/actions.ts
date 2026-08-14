"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const str = (f: FormData, k: string) => (f.get(k) ? String(f.get(k)).trim() : null);

export async function createCustomer(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const name = str(formData, "name");
  if (!name) redirect("/admin/customers?error=missing-name");
  await db()
    .insert(schema.customers)
    .values({
      name,
      company: str(formData, "company"),
      email: str(formData, "email"),
      phone: str(formData, "phone"),
      whatsapp: str(formData, "whatsapp"),
      location: str(formData, "location"),
      industry: str(formData, "industry"),
      notes: str(formData, "notes"),
    });
  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

export async function updateCustomer(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!id || !name) redirect("/admin/customers?error=missing");
  await db()
    .update(schema.customers)
    .set({
      name,
      company: str(formData, "company"),
      email: str(formData, "email"),
      phone: str(formData, "phone"),
      whatsapp: str(formData, "whatsapp"),
      location: str(formData, "location"),
      industry: str(formData, "industry"),
      status: (str(formData, "status") ?? "LEAD") as "LEAD",
      notes: str(formData, "notes"),
      updatedAt: sql`now()`,
    })
    .where(eq(schema.customers.id, id));
  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

export async function deleteCustomer(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const id = str(formData, "id");
  if (id) await db().delete(schema.customers).where(eq(schema.customers.id, id));
  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}
