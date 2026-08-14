import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";

export const metadata = { title: "Chats | Oasis Impex Admin" };

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-sky-500/10 text-sky-300",
  ASSIGNED: "bg-violet-500/10 text-violet-300",
  IN_PROGRESS: "bg-amber-500/10 text-amber-300",
  RESOLVED: "bg-slate-500/10 text-slate-400",
};

const CHANNEL_LABEL: Record<string, string> = { WEB: "Website", WHATSAPP: "WhatsApp", EMAIL: "Email" };

export default async function AdminChatsPage() {
  const dbs = db();

  const convs = await dbs
    .select({
      id: schema.conversations.id,
      channel: schema.conversations.channel,
      status: schema.conversations.status,
      createdAt: schema.conversations.createdAt,
      updatedAt: schema.conversations.updatedAt,
      lastMessage: schema.messages.content,
      lastSender: schema.messages.senderType,
    })
    .from(schema.conversations)
    .leftJoin(schema.messages, sql`${schema.messages.id} = (select id from ${schema.messages} where conversation_id = ${schema.conversations.id} order by created_at desc limit 1)`)
    .orderBy(desc(schema.conversations.updatedAt));

  const convIds = convs.map((c) => c.id);
  const lastAgentReplies = convIds.length
    ? await dbs
        .select({
          conversationId: schema.messages.conversationId,
          lastAgentAt: sql<Date>`max(${schema.messages.createdAt})`,
        })
        .from(schema.messages)
        .where(sql`conversation_id = ANY(${convIds}::uuid[]) and sender_type = 'AGENT' and direction = 'OUTBOUND'`)
        .groupBy(schema.messages.conversationId)
    : [];
  const lastAgentMap = new Map(lastAgentReplies.map((r) => [r.conversationId, new Date(r.lastAgentAt).getTime()]));

  const handoffCounts = convIds.length
    ? await dbs
        .select({
          conversationId: schema.handoffs.conversationId,
          count: sql<number>`count(*)::int`,
        })
        .from(schema.handoffs)
        .where(sql`conversation_id = ANY(${convIds}::uuid[]) and status != 'RESOLVED'`)
        .groupBy(schema.handoffs.conversationId)
    : [];
  const handoffMap = new Map(handoffCounts.map((r) => [r.conversationId, r.count]));

  const unreadMap = new Map<string, number>();
  const unread = convIds.length
    ? await dbs
        .select({
          conversationId: schema.messages.conversationId,
          senderType: schema.messages.senderType,
          createdAt: schema.messages.createdAt,
        })
        .from(schema.messages)
        .where(sql`conversation_id = ANY(${convIds}::uuid[]) and sender_type = 'USER' and direction = 'INBOUND'`)
        .orderBy(desc(schema.messages.createdAt))
    : [];
  for (const m of unread) {
    const lastAgent = lastAgentMap.get(m.conversationId) ?? 0;
    if (new Date(m.createdAt).getTime() > lastAgent) {
      unreadMap.set(m.conversationId, (unreadMap.get(m.conversationId) ?? 0) + 1);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Conversations</h1>
      <p className="mt-1 text-sm text-slate-400">Every chat, from every channel, in one inbox. Reply to take over as a human agent.</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Visitor</th>
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3">Last message</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Unread</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {convs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  No conversations yet. Chat with the widget on the public site to see it here.
                </td>
              </tr>
            ) : (
              convs.map((c) => {
                const unreadCount = unreadMap.get(c.id) ?? 0;
                const pendingHandoff = handoffMap.get(c.id) ?? 0;
                const preview = c.lastMessage
                  ? `${c.lastSender === "USER" ? "Visitor" : c.lastSender === "AGENT" ? "You" : "Bot"}: ${c.lastMessage.slice(0, 80)}`
                  : "No messages";
                return (
                  <tr key={c.id} className={`hover:bg-white/[0.02] ${c.status === "RESOLVED" ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/chats/${c.id}`} className="font-semibold text-slate-200 hover:text-accent">
                        {c.channel === "WEB" ? "Website visitor" : CHANNEL_LABEL[c.channel]} · {new Date(c.updatedAt).toLocaleString()}
                      </Link>
                      {pendingHandoff > 0 ? (
                        <span className="ml-2 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-300">
                          handoff
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-300">
                        {CHANNEL_LABEL[c.channel] ?? c.channel}
                      </span>
                    </td>
                    <td className="max-w-[240px] truncate px-4 py-3 text-slate-400">{preview}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[c.status]}`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {unreadCount > 0 ? (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-slate-950">
                          {unreadCount}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
