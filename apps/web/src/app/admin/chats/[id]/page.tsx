import { notFound } from "next/navigation";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { sendAgentMessage, resolveConversation } from "../actions";

export const metadata = { title: "Conversation | Oasis Impex Admin" };

const SENDER_LABEL: Record<string, string> = { USER: "Visitor", BOT: "Bot", AGENT: "Agent", SYSTEM: "System" };

export default async function AdminChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dbs = db();
  const [conversation, messages] = await Promise.all([
    dbs.query.conversations.findFirst({ where: eq(schema.conversations.id, id) }),
    dbs.select().from(schema.messages).where(eq(schema.messages.conversationId, id)).orderBy(asc(schema.messages.createdAt)),
  ]);
  if (!conversation) notFound();

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-3xl flex-col">
      <div className="flex items-center justify-between">
        <Link href="/admin/chats" className="text-sm text-slate-400 hover:text-white">
          ← All conversations
        </Link>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-slate-300">{conversation.channel}</span>
          <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-slate-400">{conversation.status}</span>
          <form action={resolveConversation}>
            <input type="hidden" name="conversationId" value={id} />
            <button className="rounded-lg border border-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:border-emerald-500/50">
              Mark resolved
            </button>
          </form>
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.03] p-4">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">No messages yet.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.senderType === "AGENT"
                    ? "rounded-br-md bg-accent text-slate-950"
                    : m.senderType === "BOT"
                      ? "rounded-bl-md bg-slate-800 text-slate-100"
                      : m.direction === "OUTBOUND"
                        ? "rounded-bl-md bg-slate-800 text-slate-100"
                        : "rounded-bl-md bg-slate-800/60 text-slate-200"
                }`}
              >
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-60">{SENDER_LABEL[m.senderType]}</p>
                <p className="whitespace-pre-wrap">{m.content}</p>
                <p className="mt-1 text-[10px] text-slate-500">{new Date(m.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <form action={sendAgentMessage} className="mt-4 flex gap-3">
        <input type="hidden" name="conversationId" value={id} />
        <input
          name="content"
          required
          placeholder="Reply as the Oasis Impex agent…"
          className="flex-1 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-accent"
        />
        <button className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-slate-950 hover:bg-accent/90">Send</button>
      </form>
    </div>
  );
}
