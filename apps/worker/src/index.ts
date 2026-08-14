import { and, desc, eq, gte, isNull, lt, sql } from "drizzle-orm";
import { createDb, schema } from "@oasis/db";
import { createLogger } from "@oasis/logger";
import { createEmailProvider } from "@oasis/messaging";
import { env } from "@oasis/config";

const log = createLogger("worker");
const POLL_MS = 60_000;
const IST_OFFSET_MS = 5.5 * 3600_000;
const dbs = () => createDb();

const istDateStr = (shiftDays = 0) => new Date(Date.now() + IST_OFFSET_MS + shiftDays * 24 * 3600_000).toISOString().slice(0, 10);

async function notifyNewHandoffs() {
  const db = dbs();
  const pending = await db
    .select({
      id: schema.handoffs.id,
      conversationId: schema.handoffs.conversationId,
      priority: schema.handoffs.priority,
      reason: schema.handoffs.reason,
      aiSummary: schema.handoffs.aiSummary,
      createdAt: schema.handoffs.createdAt,
    })
    .from(schema.handoffs)
    .where(and(eq(schema.handoffs.status, "NEW"), isNull(schema.handoffs.notes)));

  if (pending.length === 0) return;

  const email = createEmailProvider();
  const cfg = env();
  for (const h of pending) {
    try {
      if (cfg.ADMIN_ALERT_EMAIL) {
        await email.send({
          to: cfg.ADMIN_ALERT_EMAIL,
          subject: `[Oasis Impex] ${h.priority} handoff waiting — ${h.reason ?? "visitor asked for a human"}`,
          text: [
            `A visitor asked to speak with a human on the website chat.`,
            ``,
            `Priority: ${h.priority}`,
            `Reason: ${h.reason ?? "—"}`,
            `AI summary: ${h.aiSummary ?? "—"}`,
            `Conversation: ${cfg.APP_URL}/admin/chats/${h.conversationId}`,
            `Received: ${h.createdAt.toISOString()}`,
            ``,
            `Reply to the visitor from the admin chat console.`,
          ].join("\n"),
        });
      }
      await db.update(schema.handoffs).set({ notes: `notified ${new Date().toISOString()}` }).where(eq(schema.handoffs.id, h.id));
      log.info({ handoffId: h.id }, "handoff alert sent");
    } catch (err) {
      log.error({ err, handoffId: h.id }, "handoff alert failed");
    }
  }
}

async function sendDailyReport() {
  const cfg = env();
  const db = dbs();

  const reportTo = cfg.DAILY_REPORT_TO || cfg.ADMIN_ALERT_EMAIL;
  if (!reportTo) return;

  const [hour, minute] = cfg.DAILY_REPORT_HOUR.split(":").map(Number);
  const nowIstMs = Date.now() + IST_OFFSET_MS;
  const nowIstMin = (new Date(nowIstMs).getUTCHours() * 60 + new Date(nowIstMs).getUTCMinutes());
  const reportMin = (hour || 8) * 60 + (minute || 0);

  const lastDateRows = await db
    .select({ value: schema.settings.value })
    .from(schema.settings)
    .where(eq(schema.settings.key, "system.dailyReport.lastDate"))
    .limit(1);
  const todayIst = istDateStr();
  const lastSent = lastDateRows.length ? (lastDateRows[0].value as string) : todayIst;

  const alreadySentToday = lastSent === todayIst;
  if (alreadySentToday || nowIstMin < reportMin) return;

  const dayStartIst = nowIstMs - (nowIstMs % 86400_000);
  const dayStartUtc = new Date(dayStartIst - IST_OFFSET_MS);
  const prevDayStartUtc = new Date(dayStartUtc.getTime() - 86400_000);
  const reportDate = istDateStr(-1);

  const [orders, inquiries, customers, pendingHandoffs, lowStock] = await Promise.all([
    db
      .select({
        orderNumber: schema.orders.orderNumber,
        customer: schema.customers.name,
        product: schema.products.name,
        quantity: schema.orders.quantity,
        unit: schema.orders.unit,
        amount: schema.orders.amount,
        status: schema.orders.status,
        createdBy: schema.users.name,
      })
      .from(schema.orders)
      .innerJoin(schema.customers, eq(schema.orders.customerId, schema.customers.id))
      .leftJoin(schema.products, eq(schema.orders.productId, schema.products.id))
      .leftJoin(schema.users, eq(schema.orders.createdBy, schema.users.id))
      .where(and(gte(schema.orders.createdAt, prevDayStartUtc), lt(schema.orders.createdAt, dayStartUtc)))
      .orderBy(schema.orders.createdAt),
    db
      .select({ name: schema.inquiries.name, company: schema.inquiries.company, product: schema.products.name, status: schema.inquiries.status, createdAt: schema.inquiries.createdAt })
      .from(schema.inquiries)
      .leftJoin(schema.products, eq(schema.inquiries.productId, schema.products.id))
      .where(and(gte(schema.inquiries.createdAt, prevDayStartUtc), lt(schema.inquiries.createdAt, dayStartUtc)))
      .orderBy(schema.inquiries.createdAt),
    db
      .select({ name: schema.customers.name, company: schema.customers.company, createdAt: schema.customers.createdAt })
      .from(schema.customers)
      .where(and(gte(schema.customers.createdAt, prevDayStartUtc), lt(schema.customers.createdAt, dayStartUtc)))
      .orderBy(schema.customers.createdAt),
    db
      .select({ reason: schema.handoffs.reason, priority: schema.handoffs.priority, conversationId: schema.handoffs.conversationId, createdAt: schema.handoffs.createdAt })
      .from(schema.handoffs)
      .where(sql`${schema.handoffs.status} in ('NEW','QUEUED','ASSIGNED','IN_PROGRESS')`)
      .orderBy(desc(schema.handoffs.createdAt))
      .limit(10),
    db
      .select({
        name: schema.products.name,
        quantity: schema.inventory.quantity,
        warehouse: schema.warehouses.name,
      })
      .from(schema.inventory)
      .innerJoin(schema.products, eq(schema.inventory.productId, schema.products.id))
      .innerJoin(schema.warehouses, eq(schema.inventory.warehouseId, schema.warehouses.id))
      .where(and(sql`${schema.inventory.lowStockThreshold} is not null`, sql`${schema.inventory.quantity}::numeric <= ${schema.inventory.lowStockThreshold}::numeric`))
      .limit(10),
  ]);

  const lines: string[] = [];
  lines.push(`Oasis Impex — daily report for ${reportDate}`);
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");

  lines.push(`ORDERS ENTERED (${orders.length})`);
  if (orders.length === 0) lines.push("  None.");
  for (const o of orders) {
    lines.push(
      `  • ${o.orderNumber} — ${o.customer} | ${o.product ?? "—"} | ${o.quantity ?? "—"}${o.unit ? " " + o.unit : ""}${o.amount != null ? ` | ₹${Number(o.amount).toLocaleString("en-IN")}` : ""} | ${o.status}${o.createdBy ? ` | entered by ${o.createdBy}` : ""}`,
    );
  }
  lines.push("");

  lines.push(`NEW INQUIRIES (${inquiries.length})`);
  if (inquiries.length === 0) lines.push("  None.");
  for (const i of inquiries) {
    lines.push(`  • ${i.name}${i.company ? ` (${i.company})` : ""} | ${i.product ?? "—"} | ${i.status}`);
  }
  lines.push("");

  lines.push(`NEW CUSTOMERS (${customers.length})`);
  if (customers.length === 0) lines.push("  None.");
  for (const c of customers) {
    lines.push(`  • ${c.name}${c.company ? ` (${c.company})` : ""}`);
  }
  lines.push("");

  lines.push(`OPEN HANDOFFS (${pendingHandoffs.length})`);
  if (pendingHandoffs.length === 0) lines.push("  None — bot is handling conversations.");
  for (const h of pendingHandoffs) {
    lines.push(`  • [${h.priority}] ${h.reason ?? "visitor asked for a human"} — ${cfg.APP_URL}/admin/chats/${h.conversationId}`);
  }
  lines.push("");

  lines.push(`LOW STOCK (${lowStock.length})`);
  if (lowStock.length === 0) lines.push("  None — stock levels healthy.");
  for (const s of lowStock) {
    lines.push(`  • ${s.name} (${s.warehouse}) — ${s.quantity}`);
  }
  lines.push("");

  try {
    await createEmailProvider().send({
      to: reportTo,
      subject: `[Oasis Impex] Daily report — ${reportDate}`,
      text: lines.join("\n"),
    });
    await db
      .insert(schema.settings)
      .values({ key: "system.dailyReport.lastDate", value: todayIst })
      .onConflictDoUpdate({ target: schema.settings.key, set: { value: todayIst } });
    log.info({ reportDate }, "daily report sent");
  } catch (err) {
    log.error({ err, reportDate }, "daily report failed");
  }
}

async function tick() {
  try {
    await notifyNewHandoffs();
    await sendDailyReport();
  } catch (err) {
    log.error({ err }, "tick failed");
  }
}

const timer = setInterval(() => {
  void tick();
}, POLL_MS);

void tick();

for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, () => {
    clearInterval(timer);
    process.exit(0);
  });
}
