import { sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "./db";
import { formatOrderNumber } from "./order-number";

export { ORDER_STATUS_FLOW, ORDER_STATUS_STYLES } from "./order-status";
export type { OrderStatus } from "./order-status";

export async function nextOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const rows = await db()
    .select({ n: sql<number>`count(*)::int` })
    .from(schema.orders)
    .where(sql`extract(year from ${schema.orders.createdAt}) = ${year}`);
  const next = (rows[0]?.n ?? 0) + 1;
  return formatOrderNumber(year, next);
}
