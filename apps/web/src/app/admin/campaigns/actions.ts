"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { buildRecipients } from "@oasis/messaging";

const str = (f: FormData, k: string) => (f.get(k) ? String(f.get(k)).trim() : null);

const SEGMENTS = ["ALL", "CUSTOMERS", "LEADS", "SUBSCRIBERS"] as const;
const CHANNELS = ["EMAIL", "WHATSAPP"] as const;
const CUSTOMER_STATUSES = ["ACTIVE", "LEAD", "INACTIVE"] as const;
const INQUIRY_SOURCES = ["WEB", "CHAT", "WHATSAPP", "EMAIL"] as const;

export async function createCampaign(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "campaigns.write", "/admin/campaigns");
  const name = str(formData, "name");
  const subject = str(formData, "subject");
  const body = str(formData, "body");
  if (!name || !subject || !body) redirect("/admin/campaigns?error=missing-fields");

  const schedule = str(formData, "schedule");
  const scheduledAt = schedule ? new Date(schedule) : null;
  const channel = (CHANNELS.includes(str(formData, "channel") as never) ? str(formData, "channel") : "EMAIL") as "EMAIL" | "WHATSAPP";
  const audience = {
    segment: (SEGMENTS.includes(str(formData, "segment") as never) ? str(formData, "segment") : "CUSTOMERS") as never,
    customerStatus: CUSTOMER_STATUSES.includes(str(formData, "customerStatus") as never) ? str(formData, "customerStatus")! : undefined,
    inquirySource: INQUIRY_SOURCES.includes(str(formData, "inquirySource") as never) ? str(formData, "inquirySource")! : undefined,
  };

  const campaign = await db()
    .insert(schema.campaigns)
    .values({
      name,
      subject,
      body,
      channel,
      audience,
      status: scheduledAt ? "SCHEDULED" : "DRAFT",
      scheduledAt,
      createdBy: user.id,
    })
    .returning({ id: schema.campaigns.id });

  if (scheduledAt) await buildRecipients(db(), campaign[0].id, audience, channel);
  await logAudit({ actorUserId: user.id, action: "CAMPAIGN_CREATED", entity: "campaigns", entityId: campaign[0].id, metadata: { name, channel, status: scheduledAt ? "SCHEDULED" : "DRAFT" } });
  revalidatePath("/admin/campaigns");
  redirect(scheduledAt ? `/admin/campaigns/${campaign[0].id}` : "/admin/campaigns?created=1");
}

export async function updateCampaign(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "campaigns.write", "/admin/campaigns");
  const id = str(formData, "id");
  if (!id) redirect("/admin/campaigns");
  const name = str(formData, "name");
  const subject = str(formData, "subject");
  const body = str(formData, "body");
  if (!name || !subject || !body) redirect(`/admin/campaigns/${id}?error=missing-fields`);

  const existing = await db().select({ status: schema.campaigns.status }).from(schema.campaigns).where(eq(schema.campaigns.id, id)).limit(1);
  if (!existing[0]) redirect("/admin/campaigns");
  if (existing[0].status !== "DRAFT") redirect(`/admin/campaigns/${id}?error=sent-locked`);

  await db()
    .update(schema.campaigns)
    .set({ name, subject, body, updatedAt: sql`now()` })
    .where(eq(schema.campaigns.id, id));
  revalidatePath("/admin/campaigns");
  redirect(`/admin/campaigns/${id}?saved=1`);
}

export async function scheduleCampaign(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "campaigns.write", "/admin/campaigns");
  const id = str(formData, "id");
  const schedule = str(formData, "schedule");
  if (!id) redirect("/admin/campaigns");
  if (!schedule) redirect(`/admin/campaigns/${id}?error=missing-schedule`);
  const existing = await db().select({ status: schema.campaigns.status, audience: schema.campaigns.audience, channel: schema.campaigns.channel }).from(schema.campaigns).where(eq(schema.campaigns.id, id)).limit(1);
  if (!existing[0] || existing[0].status !== "DRAFT") redirect(`/admin/campaigns/${id}?error=sent-locked`);

  await db().update(schema.campaigns).set({ status: "SCHEDULED", scheduledAt: new Date(schedule) }).where(eq(schema.campaigns.id, id));
  await buildRecipients(db(), id, existing[0].audience ?? {}, existing[0].channel);
  await logAudit({ actorUserId: user.id, action: "CAMPAIGN_SCHEDULED", entity: "campaigns", entityId: id, metadata: { scheduledAt: schedule } });
  revalidatePath("/admin/campaigns");
  redirect(`/admin/campaigns/${id}?scheduled=1`);
}

export async function sendNow(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "campaigns.write", "/admin/campaigns");
  const id = str(formData, "id");
  if (!id) redirect("/admin/campaigns");
  const existing = await db().select({ status: schema.campaigns.status, audience: schema.campaigns.audience }).from(schema.campaigns).where(eq(schema.campaigns.id, id)).limit(1);
  if (!existing[0]) redirect("/admin/campaigns");
  if (!["DRAFT", "SCHEDULED"].includes(existing[0].status)) redirect(`/admin/campaigns/${id}?error=sent-locked`);
  await db().update(schema.campaigns).set({ status: "SCHEDULED", scheduledAt: new Date() }).where(eq(schema.campaigns.id, id));
  await buildRecipients(db(), id, existing[0].audience ?? {});
  await logAudit({ actorUserId: user.id, action: "CAMPAIGN_SEND_NOW", entity: "campaigns", entityId: id });
  revalidatePath("/admin/campaigns");
  redirect(`/admin/campaigns/${id}?queued=1`);
}

export async function deleteCampaign(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "campaigns.write", "/admin/campaigns");
  const id = str(formData, "id");
  if (id) {
    await db().delete(schema.campaigns).where(eq(schema.campaigns.id, id));
    await logAudit({ actorUserId: user.id, action: "CAMPAIGN_DELETED", entity: "campaigns", entityId: id });
  }
  revalidatePath("/admin/campaigns");
  redirect("/admin/campaigns");
}
