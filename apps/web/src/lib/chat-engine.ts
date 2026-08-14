import "server-only";
import { eq } from "drizzle-orm";
import { schema } from "@oasis/db";
import { createAIProvider } from "@oasis/ai";
import { isTrainingAvailable, retrieve, trainKnowledgeBase } from "@oasis/rag";
import { db } from "./db";
import { buildTrainingCorpus } from "./knowledge-corpus";
import { HANDOFF_KEYWORDS, SYSTEM_PROMPT, isGreeting, containsProfanity, PROFANITY_REPLY, isOutOfScope, OUT_OF_SCOPE_REPLY, isPricingIntent, QUOTE_SUFFIX } from "./agent-policy";
import { notifyTeam } from "./notify";

export { HANDOFF_KEYWORDS, SYSTEM_PROMPT } from "./agent-policy";

export interface ChatEngineOptions {
  content: string;
  conversationId?: string | null;
  channel: "WEB" | "WHATSAPP" | "EMAIL";
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

  // Greetings / acknowledgements get a warm, deterministic reply — never RAG
  // (which would surface unrelated pricing/product context for a plain "hi").
  if (isGreeting(content)) {
    const greetingReply =
      "Hello! Welcome to Oasis Impex. We supply PVC Resin, PVC Regrind, Calcium Carbonate and PET Resin. How can I help you today?";
    await dbs.insert(schema.messages).values({ conversationId: convId, senderType: "BOT", channel, direction: "OUTBOUND", content: greetingReply });
    return { reply: greetingReply, conversationId: convId, handoffCreated: false, sources: [] };
  }

  // Block abusive/profane input with a polite redirect — never sent to the AI.
  if (containsProfanity(content)) {
    await dbs.insert(schema.messages).values({ conversationId: convId, senderType: "BOT", channel, direction: "OUTBOUND", content: PROFANITY_REPLY });
    return { reply: PROFANITY_REPLY, conversationId: convId, handoffCreated: false, sources: [] };
  }

  // Clearly out-of-scope questions get a deterministic, polite refusal — never
  // routed through RAG/AI (which can drift into an off-topic answer or pitch).
  if (isOutOfScope(content)) {
    await dbs.insert(schema.messages).values({ conversationId: convId, senderType: "BOT", channel, direction: "OUTBOUND", content: OUT_OF_SCOPE_REPLY });
    return { reply: OUT_OF_SCOPE_REPLY, conversationId: convId, handoffCreated: false, sources: [] };
  }

  // Capture contact details (email / phone) the customer shares, attach them to
  // the conversation, and email the team so a sales agent can follow up.
  const emailMatch = content.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  const phoneMatch = content.match(/(?:\+?\d[\d\s-]{7,}\d)/);
  if (emailMatch || phoneMatch) {
    const capturedEmail = emailMatch?.[0];
    const capturedPhone = phoneMatch?.[0]?.replace(/\s+/g, "");
    try {
      const [conv] = await dbs.select({ metadata: schema.conversations.metadata }).from(schema.conversations).where(eq(schema.conversations.id, convId)).limit(1);
      const meta = (conv?.metadata as Record<string, unknown>) ?? {};
      await dbs
        .update(schema.conversations)
        .set({ metadata: { ...meta, ...(capturedEmail ? { email: capturedEmail } : {}), ...(capturedPhone ? { phone: capturedPhone } : {}) } })
        .where(eq(schema.conversations.id, convId));
      void notifyTeam(
        "Customer shared contact details",
        [
          { label: "Channel", value: channel },
          { label: "Email", value: capturedEmail },
          { label: "Phone", value: capturedPhone },
          { label: "Message", value: content.slice(0, 300) },
        ],
        `Open: /admin/chats/${convId}`,
        { email: true },
      );
    } catch {
      // best-effort; never block the reply on capture
    }
  }

  const ai = createAIProvider();
  const contexts = await retrieve({ query: content, visibility: "PUBLIC", limit: 4 });
  const contextBlock = contexts.map((c) => `[${c.title}] ${c.text}`).join("\n\n");
  // A greeting or acknowledgement never triggers a sales hand-off, even if it
  // happens to contain a keyword-like substring.
  const lower = content.toLowerCase();
  const needsHandoff = !isGreeting(content) && HANDOFF_KEYWORDS.some((k) => lower.includes(k));

  // Load recent conversation history so the AI answers the LATEST message with
  // full context (a greeting mid-conversation shouldn't reset the thread).
  const history = await dbs
    .select({ senderType: schema.messages.senderType, content: schema.messages.content })
    .from(schema.messages)
    .where(eq(schema.messages.conversationId, convId))
    .orderBy(schema.messages.createdAt);
  const priorTurns = history
    .filter((m) => m.senderType === "USER" || m.senderType === "BOT")
    .slice(-8, -1) // last few turns, excluding the message we just inserted
    .map((m) => ({ role: m.senderType === "USER" ? ("user" as const) : ("assistant" as const), content: m.content }));

  const reply = await ai.chat(
    [
      { role: "system", content: SYSTEM_PROMPT },
      ...priorTurns,
      { role: "user", content: `Context about Oasis Impex:\n${contextBlock || "(no specific context retrieved)"}\n\nRespond to the customer's latest message: ${content}` },
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

  // If the customer showed pricing/buying intent but the reply didn't offer a
  // quote or ask for contact details, append that ask so no lead is dropped.
  if (isPricingIntent(content) && !/(quot|share your|name.*(phone|email)|sales team|get back)/i.test(replyText)) {
    replyText = `${replyText}${QUOTE_SUFFIX}`;
  }

  let handoffCreated = false;
  if (needsHandoff) {
    // Always make sure the hand-off reply asks for the customer's contact
    // details (name, email, phone) so the sales team can follow up.
    if (!/(name|phone|email|contact)/i.test(replyText)) {
      replyText = `${replyText} To connect you with our sales team, please share your name, email and phone number and we'll get back to you shortly.`;
    } else if (!/email/i.test(replyText)) {
      replyText = `${replyText} Please also share your email so we can send you the details.`;
    }
    const [handoff] = await dbs
      .insert(schema.handoffs)
      .values({ conversationId: convId, status: "NEW", priority: "MEDIUM", initiatedBy: "BOT", reason: "User requested human/sales contact", aiSummary: replyText })
      .returning();
    handoffCreated = Boolean(handoff);
    await dbs.insert(schema.auditLogs).values({ actorType: "SYSTEM", action: "HANDOFF_CREATED", entity: "handoffs", entityId: handoff.id, metadata: { source: channel } });
    // On hand-off, email the team (this is a genuine sales lead, unlike the
    // per-message "new WhatsApp lead" alert which is intentionally email-silent).
    void notifyTeam(
      "Chat hand-off — customer wants a human",
      [
        { label: "Channel", value: channel },
        { label: "Customer message", value: content.slice(0, 300) },
        { label: "AI summary", value: replyText.slice(0, 300) },
      ],
      `Open: /admin/chats/${convId}`,
      { email: true },
    );
  }

  await dbs.insert(schema.messages).values({ conversationId: convId, senderType: "BOT", channel, direction: "OUTBOUND", content: replyText });

  return { reply: replyText, conversationId: convId, handoffCreated, sources: contexts.map((c) => c.title) };
}
