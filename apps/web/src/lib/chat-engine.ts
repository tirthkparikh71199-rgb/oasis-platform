import "server-only";
import { eq } from "drizzle-orm";
import { schema } from "@oasis/db";
import { createAIProvider } from "@oasis/ai";
import { retrieve } from "@oasis/rag";
import { db } from "./db";

export const SYSTEM_PROMPT = `You are the official AI assistant for Oasis Impex, an established importer and supplier of polymer raw materials in Ahmedabad, India, operating since 2010.

Scope: PVC Resin, PVC Regrind, Calcium Carbonate and PET Resin; PVC raw material availability and general trading questions; contacting the sales team.

Rules:
- Answer ONLY using the provided context. If the context does not cover the question, say you'll check with the team and offer to connect them to a sales agent.
- Never invent prices, grades, certifications, or facts not in the context.
- Be concise, professional, and warm. Use plain text (no markdown formatting).
- If the user asks for a price, quote, purchase, or to speak with a person, tell them you'll hand them over to a sales agent and ask for their name, phone and company.
- Never claim to be human. You are the Oasis Impex assistant.`;

const HANDOFF_KEYWORDS = ["talk to", "sales agent", "human", "call me", "call back", "speak to", "buy", "order", "purchase", "price", "quotation", "quote", "get a quote"];

export interface ChatEngineOptions {
  content: string;
  conversationId?: string | null;
  channel: "WEB" | "WHATSAPP";
  externalId?: string | null;
  page?: string;
}

export interface ChatEngineResult {
  reply: string;
  conversationId: string;
  handoffCreated: boolean;
  sources: string[];
}

export async function runChatEngine(opts: ChatEngineOptions): Promise<ChatEngineResult> {
  const { content, conversationId, channel, externalId, page } = opts;
  const dbs = db();

  let convId = conversationId ?? undefined;
  if (convId) {
    const existing = await dbs.select({ id: schema.conversations.id }).from(schema.conversations).where(eq(schema.conversations.id, convId)).limit(1);
    if (existing.length === 0) convId = undefined;
  }
  if (!convId && externalId) {
    const existing = await dbs
      .select({ id: schema.conversations.id })
      .from(schema.conversations)
      .where(eq(schema.conversations.externalId, externalId))
      .limit(1);
    if (existing.length > 0) convId = existing[0].id;
  }
  if (!convId) {
    const [conv] = await dbs
      .insert(schema.conversations)
      .values({ channel, status: "OPEN", externalId, metadata: { page: page ?? "" } })
      .returning();
    convId = conv.id;
  }

  await dbs.insert(schema.messages).values({ conversationId: convId, senderType: "USER", channel, direction: "INBOUND", content });

  const ai = createAIProvider();
  const contexts = await retrieve({ query: content, visibility: "PUBLIC", limit: 4 });
  const contextBlock = contexts.map((c) => `[${c.title}] ${c.text}`).join("\n\n");
  const needsHandoff = HANDOFF_KEYWORDS.some((k) => content.toLowerCase().includes(k));

  const reply = await ai.chat(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Context:\n${contextBlock || "(no context retrieved)"}\n\nQuestion: ${content}` },
    ],
    { maxOutputTokens: 320 },
  );

  await dbs
    .insert(schema.aiUsage)
    .values({
      provider: ai.name,
      model: ai.name === "mock" ? "mock" : process.env.AI_MODEL ?? "gemini",
      operation: "CHAT",
      inputTokens: reply.inputTokens,
      outputTokens: reply.outputTokens,
      latencyMs: reply.latencyMs,
      success: true,
      conversationId: convId,
    });

  let replyText = reply.text;
  let handoffCreated = false;
  if (needsHandoff) {
    if (!/(provide|share|give).*?(name|phone|number|contact)/i.test(reply.text)) {
      replyText = `${reply.text} I can have a sales agent call you back — just share your name and phone number here.`;
    }
    const [handoff] = await dbs
      .insert(schema.handoffs)
      .values({ conversationId: convId, status: "NEW", priority: "MEDIUM", initiatedBy: "BOT", reason: "User requested human/sales contact", aiSummary: replyText })
      .returning();
    handoffCreated = Boolean(handoff);
    await dbs.insert(schema.auditLogs).values({ actorType: "SYSTEM", action: "HANDOFF_CREATED", entity: "handoffs", entityId: handoff.id, metadata: { source: channel } });
  }

  await dbs.insert(schema.messages).values({ conversationId: convId, senderType: "BOT", channel, direction: "OUTBOUND", content: replyText });

  return { reply: replyText, conversationId: convId, handoffCreated, sources: contexts.map((c) => c.title) };
}
