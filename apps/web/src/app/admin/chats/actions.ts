"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { createWhatsAppProvider } from "@oasis/messaging";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";

export async function sendAgentMessage(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "chat.reply", "/admin/chats");
  const conversationId = String(formData.get("conversationId") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  if (!conversationId || !content) redirect("/admin/chats/" + conversationId);

  const dbs = db();
  const conv = await dbs
    .select({ channel: schema.conversations.channel, metadata: schema.conversations.metadata })
    .from(schema.conversations)
    .where(eq(schema.conversations.id, conversationId))
    .limit(1);
  const channel = conv[0]?.channel ?? "WEB";
  const meta = (conv[0]?.metadata ?? {}) as { phone?: string };

  await dbs.insert(schema.messages).values({
    conversationId,
    senderType: "AGENT",
    channel,
    direction: "OUTBOUND",
    content,
    metadata: { agentId: user.id, agentName: user.name },
  });
  await dbs
    .update(schema.conversations)
    .set({ status: "IN_PROGRESS", updatedAt: sql`now()` })
    .where(eq(schema.conversations.id, conversationId));

  if (channel === "WHATSAPP" && meta.phone) {
    try {
      await createWhatsAppProvider().send({ to: meta.phone, text: content });
    } catch (err) {
      // reply is stored even if WhatsApp delivery fails; admin can retry
      console.error("whatsapp agent reply failed", err);
    }
  }

  const handoffs = await dbs
    .select({ id: schema.handoffs.id })
    .from(schema.handoffs)
    .where(eq(schema.handoffs.conversationId, conversationId))
    .orderBy(sql`created_at desc`)
    .limit(1);
  if (handoffs.length > 0) {
    await dbs
      .update(schema.handoffs)
      .set({ status: "IN_PROGRESS", assignedTo: user.id, resolvedAt: null })
      .where(eq(schema.handoffs.id, handoffs[0].id));
  }

  revalidatePath("/admin/chats");
  revalidatePath("/admin/chats/" + conversationId);
  redirect("/admin/chats/" + conversationId);
}

export async function resolveConversation(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "chat.reply", "/admin/chats");
  const conversationId = String(formData.get("conversationId") ?? "");
  if (!conversationId) redirect("/admin/chats");

  const dbs = db();
  await dbs
    .update(schema.conversations)
    .set({ status: "RESOLVED", updatedAt: sql`now()` })
    .where(eq(schema.conversations.id, conversationId));
  await dbs
    .update(schema.handoffs)
    .set({ status: "RESOLVED", resolvedAt: new Date() })
    .where(eq(schema.handoffs.conversationId, conversationId));

  revalidatePath("/admin/chats");
  redirect("/admin/chats");
}
