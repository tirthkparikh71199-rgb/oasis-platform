"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const str = (f: FormData, k: string) => (f.get(k) ? String(f.get(k)).trim() : null);
const num = (f: FormData, k: string) => { const v = f.get(k); return v ? String(v) : null; };

export async function createWarehouse(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "inventory.manage", "/admin/inventory");
  const name = str(formData, "name");
  if (!name) redirect("/admin/inventory?error=missing-name");
  const [created] = await db()
    .insert(schema.warehouses)
    .values({
      name,
      code: str(formData, "code"),
      location: str(formData, "location"),
      address: str(formData, "address"),
      contactName: str(formData, "contactName"),
      contactPhone: str(formData, "contactPhone"),
    })
    .returning({ id: schema.warehouses.id });
  await logAudit({ actorUserId: user.id, action: "WAREHOUSE_CREATED", entity: "warehouses", entityId: created.id, metadata: { name } });
  revalidatePath("/admin/inventory");
  redirect("/admin/inventory?created=warehouse");
}

export async function updateWarehouse(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "inventory.manage", "/admin/inventory");
  const id = str(formData, "id");
  if (!id) redirect("/admin/inventory");
  await db()
    .update(schema.warehouses)
    .set({
      name: str(formData, "name") ?? undefined,
      code: str(formData, "code"),
      location: str(formData, "location"),
      address: str(formData, "address"),
      contactName: str(formData, "contactName"),
      contactPhone: str(formData, "contactPhone"),
      isActive: formData.get("isActive") === "on",
      updatedAt: sql`now()`,
    })
    .where(eq(schema.warehouses.id, id));
  await logAudit({ actorUserId: user.id, action: "WAREHOUSE_UPDATED", entity: "warehouses", entityId: id });
  revalidatePath("/admin/inventory");
  redirect("/admin/inventory?updated=warehouse");
}

export async function deleteWarehouse(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "inventory.manage", "/admin/inventory");
  const id = str(formData, "id");
  if (id) {
    await db().delete(schema.warehouses).where(eq(schema.warehouses.id, id));
    await logAudit({ actorUserId: user.id, action: "WAREHOUSE_DELETED", entity: "warehouses", entityId: id });
  }
  revalidatePath("/admin/inventory");
  redirect("/admin/inventory");
}

export async function upsertInventory(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "inventory.write", "/admin/inventory");
  const productId = str(formData, "productId");
  const warehouseId = str(formData, "warehouseId");
  const quantity = num(formData, "quantity");
  const unit = str(formData, "unit");
  const lowStockThreshold = num(formData, "lowStockThreshold");
  const notes = str(formData, "notes");

  if (!productId || !warehouseId) redirect("/admin/inventory?error=missing-fields");

  const existing = await db()
    .select({ id: schema.inventory.id })
    .from(schema.inventory)
    .where(sql`${schema.inventory.productId} = ${productId} AND ${schema.inventory.warehouseId} = ${warehouseId}`)
    .limit(1);

  if (existing.length > 0) {
    await db()
      .update(schema.inventory)
      .set({
        quantity: quantity ?? "0",
        unit,
        lowStockThreshold,
        notes,
        lastUpdated: sql`now()`,
        updatedBy: user.id,
      })
      .where(eq(schema.inventory.id, existing[0].id));
    await logAudit({ actorUserId: user.id, action: "INVENTORY_UPDATED", entity: "inventory", entityId: existing[0].id, metadata: { productId, warehouseId, quantity } });
  } else {
    const [created] = await db()
      .insert(schema.inventory)
      .values({
        productId,
        warehouseId,
        quantity: quantity ?? "0",
        unit,
        lowStockThreshold,
        notes,
        updatedBy: user.id,
      })
      .returning({ id: schema.inventory.id });
    await logAudit({ actorUserId: user.id, action: "INVENTORY_CREATED", entity: "inventory", entityId: created.id, metadata: { productId, warehouseId, quantity } });
  }

  revalidatePath("/admin/inventory");
  redirect("/admin/inventory?updated=inventory");
}

export async function deleteInventory(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "inventory.manage", "/admin/inventory");
  const id = str(formData, "id");
  if (id) {
    await db().delete(schema.inventory).where(eq(schema.inventory.id, id));
    await logAudit({ actorUserId: user.id, action: "INVENTORY_DELETED", entity: "inventory", entityId: id });
  }
  revalidatePath("/admin/inventory");
  redirect("/admin/inventory");
}
