import { eq } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { OrderForm } from "../order-form";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const user = await requireUser();
  requirePerm(user, "orders.write", "/admin/orders");
  const [customers, products] = await Promise.all([
    db().select({ id: schema.customers.id, name: schema.customers.name }).from(schema.customers).orderBy(schema.customers.name),
    db().select({ id: schema.products.id, name: schema.products.name }).from(schema.products).where(eq(schema.products.isActive, true)).orderBy(schema.products.name),
  ]);

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold text-white">New order</h1>
      <div className="mt-6">
        <OrderForm customers={customers} products={products} />
      </div>
    </div>
  );
}
