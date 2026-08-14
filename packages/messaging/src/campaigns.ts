import { and, eq, lte, or } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { schema } from "@oasis/db";
import { createLogger } from "@oasis/logger";
import { createEmailProvider } from "./email";
import { createWhatsAppProvider } from "./whatsapp";
import { signToken } from "./unsubscribe";

const log = createLogger("campaigns");

export type CampaignDb = NodePgDatabase<typeof schema>;

const THROTTLE_MS = 250;
const CAN_SPAM_ADDRESS = "Oasis Impex, 1112 Fortune Business Hub, Science City Road, Ahmedabad, Gujarat 380060 India";

function throttle(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function sendDueCampaigns(db: CampaignDb, secret: string, appUrl: string): Promise<number> {
  const due = await db
    .select()
    .from(schema.campaigns)
    .where(and(or(eq(schema.campaigns.status, "SCHEDULED"), eq(schema.campaigns.status, "SENDING")), lte(schema.campaigns.scheduledAt, new Date())));

  let sentTotal = 0;
  for (const campaign of due) {
    try {
      if (campaign.status === "SCHEDULED") {
        await buildRecipients(db, campaign.id, campaign.audience ?? {}, campaign.channel);
        await db.update(schema.campaigns).set({ status: "SENDING" }).where(eq(schema.campaigns.id, campaign.id));
      }

      const pending = await db
        .select()
        .from(schema.campaignRecipients)
        .where(and(eq(schema.campaignRecipients.campaignId, campaign.id), eq(schema.campaignRecipients.status, "PENDING")));

      if (campaign.channel === "WHATSAPP") {
        const whatsapp = createWhatsAppProvider();
        if (!whatsapp.isConfigured()) {
          await db.update(schema.campaigns).set({ status: "FAILED" }).where(eq(schema.campaigns.id, campaign.id));
          log.warn({ campaignId: campaign.id }, "whatsapp campaign skipped: provider not configured");
          continue;
        }
      } else {
        const email = createEmailProvider();
        if (!email.isConfigured()) {
          await db.update(schema.campaigns).set({ status: "FAILED" }).where(eq(schema.campaigns.id, campaign.id));
          log.warn({ campaignId: campaign.id }, "email campaign skipped: email transport not configured");
          continue;
        }
      }

      let sent = 0;
      let failed = 0;
      for (const r of pending) {
        try {
          if (campaign.channel === "WHATSAPP") {
            if (!r.phone) throw new Error("no phone number");
            const body = `${campaign.body}\n\nReply STOP to opt out.`;
            await createWhatsAppProvider().send({ to: r.phone, text: body });
          } else {
            if (!r.email) throw new Error("no email address");
            const unsubUrl = `${appUrl}/unsubscribe?e=${encodeURIComponent(r.email)}&t=${signToken(r.email, secret)}`;
            const body = `${campaign.body}\n\n---\nOasis Impex\n${CAN_SPAM_ADDRESS}\nUnsubscribe: ${unsubUrl}`;
            await createEmailProvider().send({
              to: r.email,
              subject: campaign.subject,
              text: body,
              headers: {
                "List-Unsubscribe": `<${unsubUrl}>`,
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
                "X-Campaign-Id": campaign.id,
              },
            });
          }
          await db.update(schema.campaignRecipients).set({ status: "SENT", sentAt: new Date() }).where(eq(schema.campaignRecipients.id, r.id));
          sent += 1;
        } catch (err) {
          await db.update(schema.campaignRecipients).set({ status: "FAILED", error: err instanceof Error ? err.message : "send failed" }).where(eq(schema.campaignRecipients.id, r.id));
          failed += 1;
        }
        await throttle(THROTTLE_MS);
      }

      await db
        .update(schema.campaigns)
        .set({ status: "SENT", sentAt: new Date(), sentCount: sent, failedCount: failed })
        .where(eq(schema.campaigns.id, campaign.id));

      sentTotal += sent;
      log.info({ campaignId: campaign.id, channel: campaign.channel, sent, failed }, "campaign sent");
    } catch (err) {
      log.error({ err, campaignId: campaign.id }, "campaign send failed");
      await db.update(schema.campaigns).set({ status: "FAILED" }).where(eq(schema.campaigns.id, campaign.id));
    }
  }
  return sentTotal;
}

export async function buildRecipients(db: CampaignDb, campaignId: string, audience: { segment?: "ALL" | "CUSTOMERS" | "LEADS" | "SUBSCRIBERS"; customerStatus?: string; inquirySource?: string }, channel: "EMAIL" | "WHATSAPP" = "EMAIL"): Promise<number> {
  const segment = audience.segment ?? "CUSTOMERS";
  const emails: string[] = [];
  const phones: string[] = [];

  const [customers, leads, subscribers] = await Promise.all([
    db
      .select({ email: schema.customers.email, whatsapp: schema.customers.whatsapp, phone: schema.customers.phone })
      .from(schema.customers)
      .where(customerStatusCond(audience.customerStatus)),
    db
      .select({ email: schema.inquiries.email, whatsapp: schema.inquiries.whatsapp, phone: schema.inquiries.phone })
      .from(schema.inquiries)
      .where(sourceCond(audience.inquirySource)),
    db.select({ email: schema.subscribers.email, phone: schema.subscribers.phone }).from(schema.subscribers).where(eq(schema.subscribers.unsubscribed, false)),
  ]);

  if (channel === "EMAIL") {
    if (segment === "CUSTOMERS" || segment === "ALL") emails.push(...customers.map((c) => c.email).filter((e): e is string => Boolean(e)));
    if (segment === "LEADS" || segment === "ALL") emails.push(...leads.map((l) => l.email).filter((e): e is string => Boolean(e)));
    if (segment === "SUBSCRIBERS" || segment === "ALL") emails.push(...subscribers.map((s) => s.email).filter((e): e is string => Boolean(e)));
  } else {
    const withPhone = (w: string | null, p: string | null) => (w ? w : p);
    if (segment === "CUSTOMERS" || segment === "ALL") phones.push(...customers.map((c) => withPhone(c.whatsapp, c.phone)).filter((p): p is string => Boolean(p)));
    if (segment === "LEADS" || segment === "ALL") phones.push(...leads.map((l) => withPhone(l.whatsapp, l.phone)).filter((p): p is string => Boolean(p)));
    if (segment === "SUBSCRIBERS" || segment === "ALL") phones.push(...subscribers.map((s) => s.phone).filter((p): p is string => Boolean(p)));
  }

  const uniq = [...new Set(channel === "EMAIL" ? emails : phones)];

  // Suppression: exclude unsubscribed + blocked
  const suppressedEmails = new Set<string>();
  const suppressedDomains = new Set<string>();
  const suppressedPhones = new Set<string>();
  if (channel === "EMAIL") {
    const [unsubs, blocks] = await Promise.all([
      db.select({ email: schema.subscribers.email }).from(schema.subscribers).where(eq(schema.subscribers.unsubscribed, true)),
      db.select({ kind: schema.emailBlocks.kind, value: schema.emailBlocks.value }).from(schema.emailBlocks),
    ]);
    for (const u of unsubs) if (u.email) suppressedEmails.add(u.email.toLowerCase());
    for (const b of blocks) {
      if (b.kind === "EMAIL") suppressedEmails.add(b.value.toLowerCase());
      else suppressedDomains.add(b.value.toLowerCase());
    }
  } else {
    const unsubs = await db.select({ phone: schema.subscribers.phone }).from(schema.subscribers).where(eq(schema.subscribers.unsubscribed, true));
    for (const u of unsubs) if (u.phone) suppressedPhones.add(u.phone);
  }

  const filtered = uniq.filter((v) => {
    if (channel === "EMAIL") {
      const lower = v.toLowerCase();
      if (suppressedEmails.has(lower)) return false;
      const domain = lower.split("@")[1];
      if (domain && suppressedDomains.has(domain)) return false;
      return true;
    }
    return !suppressedPhones.has(v);
  });

  const existing = await db.select({ email: schema.campaignRecipients.email, phone: schema.campaignRecipients.phone }).from(schema.campaignRecipients).where(eq(schema.campaignRecipients.campaignId, campaignId));
  const seen = new Set(existing.map((e) => (channel === "EMAIL" ? e.email : e.phone)));
  const fresh = filtered.filter((v) => !seen.has(v));

  if (fresh.length) {
    await db
      .insert(schema.campaignRecipients)
      .values(fresh.map((v) => (channel === "EMAIL" ? { campaignId, email: v } : { campaignId, phone: v })));
  }
  await db.update(schema.campaigns).set({ totalRecipients: filtered.length }).where(eq(schema.campaigns.id, campaignId));
  return fresh.length;
}

function customerStatusCond(status?: string) {
  return status ? eq(schema.customers.status, status as never) : undefined;
}

function sourceCond(source?: string) {
  return source ? eq(schema.inquiries.source, source as never) : undefined;
}
