import "server-only";
import { eq, sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { createEmailProvider } from "@oasis/messaging";
import { env } from "@oasis/config";
import { createLogger } from "@oasis/logger";

const log = createLogger("billing-alert");

export async function checkMarketingUsageAndAlert(): Promise<void> {
  const cfg = env();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get marketing usage
  const [result] = await db()
    .select({ count: sql<number>`coalesce(sum(${schema.campaigns.sentCount}), 0)::int` })
    .from(schema.campaigns)
    .where(sql`${schema.campaigns.createdAt} >= ${monthStart} AND ${schema.campaigns.status} = 'SENT'`);

  const used = result?.count ?? 0;
  const limit = 1000;
  const percentage = Math.round((used / limit) * 100);

  // Check last alert sent
  const [lastAlert] = await db()
    .select({ value: schema.settings.value })
    .from(schema.settings)
    .where(eq(schema.settings.key, "billing.lastAlert"))
    .limit(1);

  const lastAlertData = (lastAlert?.value as { percentage?: number; date?: string }) ?? {};
  const lastAlertPct = lastAlertData.percentage ?? 0;
  const lastAlertDate = lastAlertData.date ?? "";

  const today = now.toISOString().slice(0, 10);
  const alreadyAlertedToday = lastAlertDate === today && lastAlertPct >= percentage;

  if (alreadyAlertedToday) return;

  // Alert thresholds
  if (percentage >= 100) {
    await sendAlert("CRITICAL", used, limit, percentage, cfg);
    await updateAlertSetting(percentage);
  } else if (percentage >= 95) {
    await sendAlert("WARNING", used, limit, percentage, cfg);
    await updateAlertSetting(percentage);
  } else if (percentage >= 80) {
    await sendAlert("NOTICE", used, limit, percentage, cfg);
    await updateAlertSetting(percentage);
  }
}

async function sendAlert(level: string, used: number, limit: number, percentage: number, cfg: ReturnType<typeof env>): Promise<void> {
  const email = createEmailProvider();
  if (!email.isConfigured()) return;

  const to = cfg.ADMIN_ALERT_EMAIL;
  if (!to) return;

  const subject = `[Oasis Impex] WhatsApp Marketing ${level} — ${percentage}% used`;
  const body = [
    `WhatsApp Marketing Usage Alert`,
    `-----------------------------------`,
    `Level: ${level}`,
    `Used: ${used} / ${limit} conversations`,
    `Percentage: ${percentage}%`,
    `Remaining: ${limit - used} conversations`,
    ``,
    level === "CRITICAL" ? "ACTION: AI has STOPPED marketing messages. Service conversations continue." : "",
    level === "WARNING" ? "ACTION: Approaching limit. Consider stopping marketing campaigns." : "",
    level === "NOTICE" ? "FYI: Usage is above 80%. Monitor closely." : "",
    ``,
    `View usage: ${cfg.APP_URL}/admin/usage`,
  ].join("\n");

  try {
    await email.send({ to, subject, text: body });
    log.info({ level, used, percentage }, "billing alert sent");
  } catch (err) {
    log.error({ err }, "billing alert failed");
  }
}

async function updateAlertSetting(percentage: number): Promise<void> {
  await db()
    .insert(schema.settings)
    .values({
      key: "billing.lastAlert",
      value: { percentage, date: new Date().toISOString().slice(0, 10), timestamp: new Date().toISOString() },
    })
    .onConflictDoUpdate({
      target: schema.settings.key,
      set: { value: { percentage, date: new Date().toISOString().slice(0, 10), timestamp: new Date().toISOString() } },
    });
}
