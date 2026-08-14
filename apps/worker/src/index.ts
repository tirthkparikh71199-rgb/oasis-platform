import { and, eq, isNull } from "drizzle-orm";
import { createDb, schema } from "@oasis/db";
import { createLogger } from "@oasis/logger";
import { createEmailProvider } from "@oasis/messaging";
import { env } from "@oasis/config";

const log = createLogger("worker");
const POLL_MS = 60_000;
const dbs = () => createDb();

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

async function tick() {
  try {
    await notifyNewHandoffs();
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
