"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";

const str = (f: FormData, k: string) => (f.get(k) ? String(f.get(k)).trim() : null);

export async function createWarehouse(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "inventory.write", "/admin/warehouses");
  const name = str(formData, "name");
  if (!name) redirect("/admin/warehouses?error=missing-name");
  await db().insert(schema.warehouses).values({
    name,
    code: str(formData, "code"),
    location: str(formData, "location"),
    address: str(formData, "address"),
    contactName: str(formData, "contactName"),
    contactPhone: str(formData, "contactPhone"),
  });
  revalidatePath("/admin/warehouses");
  redirect("/admin/warehouses");
}

export async function deleteWarehouse(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "inventory.manage", "/admin/warehouses");
  const id = str(formData, "id");
  if (id) await db().delete(schema.warehouses).where(eq(schema.warehouses.id, id));
  revalidatePath("/admin/warehouses");
  redirect("/admin/warehouses");
}

export async function setStock(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "inventory.write", "/admin/warehouses");
  const id = str(formData, "id");
  const quantity = str(formData, "quantity") ?? "0";
  const threshold = str(formData, "lowStockThreshold");
  const status = str(formData, "status") as "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK" | "IN_TRANSIT";
  if (!id) redirect("/admin/warehouses?error=missing");
  await db()
    .update(schema.inventory)
    .set({
      quantity,
      reservedQuantity: str(formData, "reservedQuantity") ?? undefined,
      lowStockThreshold: threshold,
      status,
      lastUpdated: new Date(),
      updatedBy: user.id,
    })
    .where(eq(schema.inventory.id, id));
  revalidatePath("/admin/warehouses");
  redirect("/admin/warehouses");
}
