"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { nextOrderNumber } from "@/lib/orders";

const str = (f: FormData, k: string) => (f.get(k) ? String(f.get(k)).trim() : null);

type OrderStatus = (typeof schema.orders.$inferSelect)["status"];

export async function createOrder(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "orders.write", "/admin/orders");

  const customerId = str(formData, "customerId");
  if (!customerId) redirect("/admin/orders?error=missing-customer");

  const orderNumber = await nextOrderNumber();
  await db()
    .insert(schema.orders)
    .values({
      orderNumber,
      customerId,
      productId: str(formData, "productId"),
      quantity: str(formData, "quantity"),
      unit: str(formData, "unit"),
      amount: str(formData, "amount"),
      status: (str(formData, "status") as OrderStatus) ?? "NEW",
      expectedDate: str(formData, "expectedDate"),
      notes: str(formData, "notes"),
      createdBy: user.id,
    });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  redirect("/admin/orders?created=1");
}

export async function updateOrder(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "orders.write", "/admin/orders");
  const id = str(formData, "id");
  if (!id) redirect("/admin/orders?error=missing-id");

  await db()
    .update(schema.orders)
    .set({
      customerId: str(formData, "customerId") ?? undefined,
      productId: str(formData, "productId"),
      quantity: str(formData, "quantity"),
      unit: str(formData, "unit"),
      amount: str(formData, "amount"),
      status: (str(formData, "status") as OrderStatus) ?? undefined,
      expectedDate: str(formData, "expectedDate"),
      notes: str(formData, "notes"),
      updatedAt: sql`now()`,
    })
    .where(eq(schema.orders.id, id));

  revalidatePath("/admin/orders");
  revalidatePath("/admin/orders/" + id);
  revalidatePath("/admin");
  redirect("/admin/orders");
}

export async function updateOrderStatus(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "orders.write", "/admin/orders");
  const id = str(formData, "id");
  const status = str(formData, "status");
  if (!id || !status) redirect("/admin/orders");
  await db()
    .update(schema.orders)
    .set({ status: status as OrderStatus, updatedAt: sql`now()` })
    .where(eq(schema.orders.id, id));
  revalidatePath("/admin/orders");
  revalidatePath("/admin/orders/" + id);
  redirect("/admin/orders/" + id);
}

export async function deleteOrder(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "orders.manage", "/admin/orders");
  const id = str(formData, "id");
  if (id) await db().delete(schema.orders).where(eq(schema.orders.id, id));
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  redirect("/admin/orders");
}
