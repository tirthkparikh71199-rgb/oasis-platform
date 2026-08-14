"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const str = (f: FormData, k: string) => (f.get(k) ? String(f.get(k)).trim() : null);

export async function createCustomer(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "partners.write", "/admin/customers");
  const name = str(formData, "name");
  if (!name) redirect("/admin/customers?error=missing-name");
  const [created] = await db()
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
    })
    .returning({ id: schema.customers.id });
  await logAudit({ actorUserId: user.id, action: "CUSTOMER_CREATED", entity: "customers", entityId: created.id, metadata: { name, email: str(formData, "email") } });
  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

export async function updateCustomer(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "partners.write", "/admin/customers");
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
  await logAudit({ actorUserId: user.id, action: "CUSTOMER_UPDATED", entity: "customers", entityId: id, metadata: { name } });
  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

export async function deleteCustomer(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "partners.write", "/admin/customers");
  const id = str(formData, "id");
  if (id) {
    await db().delete(schema.customers).where(eq(schema.customers.id, id));
    await logAudit({ actorUserId: user.id, action: "CUSTOMER_DELETED", entity: "customers", entityId: id });
  }
  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else inQuotes = false;
      } else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") cell += ch;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

export async function importCustomers(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "partners.write", "/admin/customers");
  const file = formData.get("file");
  if (!(file instanceof File)) redirect("/admin/customers?import=error");
  const text = await file.text();
  const rows = parseCsv(text);
  if (rows.length < 2) redirect("/admin/customers?import=error");

  const header = rows[0].map((h) => h.trim().toLowerCase().replace(/[^a-z]/g, ""));
  const col = (name: string) => header.indexOf(name);

  const values: Array<{ name: string; company: string | null; email: string | null; phone: string | null; whatsapp: string | null; location: string | null; industry: string | null; notes: string | null }> = [];
  for (const r of rows.slice(1)) {
    const name = r[col("name")]?.trim();
    if (!name) continue;
    values.push({
      name,
      company: r[col("company")]?.trim() || null,
      email: r[col("email")]?.trim() || null,
      phone: r[col("phone")]?.trim() || null,
      whatsapp: r[col("whatsapp")]?.trim() || null,
      location: r[col("location")]?.trim() || null,
      industry: r[col("industry")]?.trim() || null,
      notes: r[col("notes")]?.trim() || null,
    });
  }
  if (values.length === 0) redirect("/admin/customers?import=error");

  await db().insert(schema.customers).values(values);
  await logAudit({ actorUserId: user.id, action: "CUSTOMERS_IMPORTED", entity: "customers", metadata: { count: values.length } });
  revalidatePath("/admin/customers");
  redirect(`/admin/customers?imported=${values.length}`);
}
