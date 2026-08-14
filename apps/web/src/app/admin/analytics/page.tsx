import { sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";

export const metadata = { title: "Analytics | Oasis Impex Admin" };

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const user = await requireUser();
  requirePerm(user, "analytics.read", "/admin");
  const dbs = db();

  const [inquiryBySource, inquiryByStatus, inquiry30d, chatByChannel, handoffsByStatus, requestsByStatus, aiTotals, msgs30d] = await Promise.all([
    dbs.select({ k: schema.inquiries.source, n: sql<number>`count(*)::int` }).from(schema.inquiries).groupBy(schema.inquiries.source),
    dbs.select({ k: schema.inquiries.status, n: sql<number>`count(*)::int` }).from(schema.inquiries).groupBy(schema.inquiries.status),
    dbs.select({ n: sql<number>`count(*)::int` }).from(schema.inquiries).where(sql`created_at > now() - interval '30 days'`),
    dbs.select({ k: schema.conversations.channel, n: sql<number>`count(*)::int` }).from(schema.conversations).groupBy(schema.conversations.channel),
    dbs.select({ k: schema.handoffs.status, n: sql<number>`count(*)::int` }).from(schema.handoffs).groupBy(schema.handoffs.status),
    dbs.select({ k: schema.productRequests.status, n: sql<number>`count(*)::int` }).from(schema.productRequests).groupBy(schema.productRequests.status),
    dbs.select({
      calls: sql<number>`count(*)::int`,
      ok: sql<number>`count(*) filter (where success)::int`,
      inTokens: sql<number>`coalesce(sum(input_tokens),0)::int`,
      outTokens: sql<number>`coalesce(sum(output_tokens),0)::int`,
    }).from(schema.aiUsage),
    dbs.select({ n: sql<number>`count(*)::int` }).from(schema.messages).where(sql`created_at > now() - interval '30 days'`),
  ]);

  const totalInquiries = inquiryByStatus.reduce((s, r) => s + r.n, 0);
  const totalChats = chatByChannel.reduce((s, r) => s + r.n, 0);
  const totalHandoffs = handoffsByStatus.reduce((s, r) => s + r.n, 0);
  const totalRequests = requestsByStatus.reduce((s, r) => s + r.n, 0);

  const sourceColors: Record<string, string> = { WEB: "bg-blue-500", CHAT: "bg-violet-500", WHATSAPP: "bg-emerald-500", EMAIL: "bg-amber-500" };
  const bar = (n: number, total: number) => (total === 0 ? 0 : Math.max(4, Math.round((n / total) * 100)));

  const cards: Array<{ label: string; value: number | string; hint: string }> = [
    { label: "Total leads", value: totalInquiries, hint: `${inquiry30d[0]?.n ?? 0} in last 30 days` },
    { label: "Chats & WhatsApp", value: totalChats, hint: `${msgs30d[0]?.n ?? 0} messages in 30 days` },
    { label: "Handoffs to team", value: totalHandoffs, hint: "bot → human" },
    { label: "Product requests", value: totalRequests, hint: "new products wanted" },
    { label: "AI assistant", value: `${aiTotals[0]?.ok ?? 0}/${aiTotals[0]?.calls ?? 0}`, hint: `${(aiTotals[0]?.inTokens ?? 0) + (aiTotals[0]?.outTokens ?? 0)} tokens used` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Analytics</h1>
      <p className="mt-1 text-sm text-slate-400">How enquiries and conversations flow into the business.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{c.label}</p>
            <p className="mt-2 text-3xl font-extrabold text-white">{c.value}</p>
            <p className="mt-1 text-[11px] text-slate-500">{c.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Leads by channel</h2>
          <div className="mt-4 space-y-3">
            {inquiryBySource.map((r) => (
              <div key={r.k}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{r.k}</span>
                  <span className="font-semibold text-white">{r.n}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/5">
                  <div className={`h-full rounded-full ${sourceColors[r.k] ?? "bg-slate-500"}`} style={{ width: `${bar(r.n, totalInquiries)}%` }} />
                </div>
              </div>
            ))}
            {inquiryBySource.length === 0 ? <p className="text-sm text-slate-500">No leads yet.</p> : null}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Leads by pipeline stage</h2>
          <div className="mt-4 space-y-3">
            {inquiryByStatus.map((r) => (
              <div key={r.k}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{r.k}</span>
                  <span className="font-semibold text-white">{r.n}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${bar(r.n, totalInquiries)}%` }} />
                </div>
              </div>
            ))}
            {inquiryByStatus.length === 0 ? <p className="text-sm text-slate-500">No leads yet.</p> : null}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Chats by channel</h2>
          <div className="mt-4 space-y-3">
            {chatByChannel.map((r) => (
              <div key={r.k}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{r.k}</span>
                  <span className="font-semibold text-white">{r.n}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${bar(r.n, totalChats)}%` }} />
                </div>
              </div>
            ))}
            {chatByChannel.length === 0 ? <p className="text-sm text-slate-500">No conversations yet.</p> : null}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Product requests by status</h2>
          <div className="mt-4 space-y-3">
            {requestsByStatus.map((r) => (
              <div key={r.k}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{r.k}</span>
                  <span className="font-semibold text-white">{r.n}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-violet-500" style={{ width: `${bar(r.n, totalRequests)}%` }} />
                </div>
              </div>
            ))}
            {requestsByStatus.length === 0 ? <p className="text-sm text-slate-500">No product requests yet.</p> : null}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Handoffs by status</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {handoffsByStatus.map((r) => (
              <span key={r.k} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                {r.k}: <span className="font-bold text-white">{r.n}</span>
              </span>
            ))}
            {handoffsByStatus.length === 0 ? <p className="text-sm text-slate-500">No handoffs yet.</p> : null}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Google Analytics</h2>
        <p className="mt-2 text-sm text-slate-400">
          The public website loads Google Analytics 4 when a <code className="text-accent">GA_MEASUREMENT_ID</code> is configured (env). Visit the GA console for full visitor behaviour:
        </p>
        <a
          href="https://analytics.google.com/"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-accent/90"
        >
          Open Google Analytics →
        </a>
      </div>
    </div>
  );
}
