"use server";

import { eq } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function unsubscribeAction(email: string, token: string) {
  const { verifyToken } = await import("@oasis/messaging");
  const { env } = await import("@oasis/config");

  const secret = env().SESSION_SECRET;
  if (!verifyToken(email, token, secret)) {
    return { ok: false, error: "Invalid or expired link." };
  }

  const normalized = email.toLowerCase().trim();
  const existing = await db().select({ id: schema.subscribers.id, unsubscribed: schema.subscribers.unsubscribed }).from(schema.subscribers).where(eq(schema.subscribers.email, normalized)).limit(1);

  if (existing.length === 0) {
    await db().insert(schema.subscribers).values({ email: normalized, unsubscribed: true, source: "UNSUBSCRIBE" });
  } else if (!existing[0].unsubscribed) {
    await db().update(schema.subscribers).set({ unsubscribed: true }).where(eq(schema.subscribers.id, existing[0].id));
  }

  await logAudit({ actorType: "SYSTEM", action: "UNSUBSCRIBED", entity: "subscribers", metadata: { email: normalized } });
  return { ok: true };
}

export async function resubscribeAction(email: string) {
  const normalized = email.toLowerCase().trim();
  const existing = await db().select({ id: schema.subscribers.id }).from(schema.subscribers).where(eq(schema.subscribers.email, normalized)).limit(1);

  if (existing.length === 0) {
    await db().insert(schema.subscribers).values({ email: normalized, unsubscribed: false, source: "RESUBSCRIBE" });
  } else {
    await db().update(schema.subscribers).set({ unsubscribed: false }).where(eq(schema.subscribers.id, existing[0].id));
  }

  await logAudit({ actorType: "SYSTEM", action: "RESUBSCRIBED", entity: "subscribers", metadata: { email: normalized } });
  return { ok: true };
}
