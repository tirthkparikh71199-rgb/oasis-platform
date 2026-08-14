import "server-only";
import { eq } from "drizzle-orm";
import { schema } from "@oasis/db";
import { createAIProvider } from "@oasis/ai";
import { isTrainingAvailable, retrieve, trainKnowledgeBase } from "@oasis/rag";
import { db } from "./db";
import { buildTrainingCorpus } from "./knowledge-corpus";
import { HANDOFF_KEYWORDS, SYSTEM_PROMPT } from "./agent-policy";

export { HANDOFF_KEYWORDS, SYSTEM_PROMPT } from "./agent-policy";

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

export async function ensureAgentTrained(): Promise<void> {
  try {
    const dbs = db();
    const [trained] = await dbs
      .select({ value: schema.settings.value })
      .from(schema.settings)
      .where(eq(schema.settings.key, "system.agentTrained"))
      .limit(1);
    if ((trained?.value as { at?: string } | undefined)?.at) return;
    if (!isTrainingAvailable()) return;

    const [inProgress] = await dbs
      .select({ value: schema.settings.value })
      .from(schema.settings)
      .where(eq(schema.settings.key, "system.agentTraining"))
      .limit(1);
    if (inProgress) return;

    await dbs
      .insert(schema.settings)
      .values({ key: "system.agentTraining", value: { at: new Date().toISOString() } })
      .onConflictDoNothing({ target: schema.settings.key });

    const corpus = await buildTrainingCorpus();
    const res = await trainKnowledgeBase(corpus);
    await dbs
      .insert(schema.settings)
      .values({ key: "system.agentTrained", value: { at: new Date().toISOString(), docs: corpus.length, indexed: res.indexed, skipped: res.skipped } })
      .onConflictDoUpdate({ target: schema.settings.key, set: { value: { at: new Date().toISOString(), docs: corpus.length, indexed: res.indexed, skipped: res.skipped }, updatedAt: new Date() } });
  } catch {
    // training is best-effort; chat continues with graceful fallback
  }
}

export async function runChatEngine(opts: ChatEngineOptions): Promise<ChatEngineResult> {
  const { content, conversationId, channel, externalId, page } = opts;
  const dbs = db();

  void ensureAgentTrained();

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
