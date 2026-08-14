import Link from "next/link";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const INQUIRY_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "IN_PROGRESS", "CONVERTED", "CLOSED"] as const;
const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-sky-500/10 text-sky-300",
  CONTACTED: "bg-violet-500/10 text-violet-300",
  QUALIFIED: "bg-blue-500/10 text-blue-300",
  IN_PROGRESS: "bg-amber-500/10 text-amber-300",
  CONVERTED: "bg-emerald-500/10 text-emerald-300",
  CLOSED: "bg-slate-500/10 text-slate-400",
};

export default async function AdminDashboard() {
  const user = await getSessionUser();
  const dbs = db();

  const [kpi, lowStock, statuses, recentInquiries, openHandoffs, topProducts, sources] = await Promise.all([
    dbs.select({
      products: sql<number>`(select count(*)::int from ${schema.products})`,
      liveProducts: sql<number>`(select count(*)::int from ${schema.products} where is_public = true)`,
      customers: sql<number>`(select count(*)::int from ${schema.customers})`,
      inquiries: sql<number>`(select count(*)::int from ${schema.inquiries})`,
      newInquiries: sql<number>`(select count(*)::int from ${schema.inquiries} where status = 'NEW')`,
      openHandoffs: sql<number>`(select count(*)::int from ${schema.handoffs} where status in ('NEW','QUEUED','ASSIGNED','IN_PROGRESS'))`,
      openConvs: sql<number>`(select count(*)::int from ${schema.conversations} where status != 'RESOLVED')`,
      unreadMsgs: sql<number>`(select count(*)::int from ${schema.messages} where sender_type = 'USER' and direction = 'INBOUND')`,
      avgReplyMs: sql<number>`(select avg(latency_ms)::int from ${schema.aiUsage} where success = true and operation = 'CHAT')`,
    })
      .from(schema.products)
      .limit(1),
    dbs
      .select({
        name: schema.products.name,
        quantity: schema.inventory.quantity,
        warehouse: schema.warehouses.name,
        threshold: schema.inventory.lowStockThreshold,
      })
      .from(schema.inventory)
      .innerJoin(schema.products, eq(schema.inventory.productId, schema.products.id))
      .innerJoin(schema.warehouses, eq(schema.inventory.warehouseId, schema.warehouses.id))
      .where(
        and(
          sql`${schema.inventory.lowStockThreshold} is not null`,
          sql`${schema.inventory.quantity}::numeric <= ${schema.inventory.lowStockThreshold}::numeric`,
        ),
      )
      .orderBy(sql`${schema.inventory.quantity}::numeric`)
      .limit(8),
    Promise.all(
      INQUIRY_STATUSES.map((s) =>
        dbs.select({ n: sql<number>`count(*)::int` }).from(schema.inquiries).where(eq(schema.inquiries.status, s)),
      ),
    ),
    dbs
      .select({
        id: schema.inquiries.id,
        name: schema.inquiries.name,
        company: schema.inquiries.company,
        status: schema.inquiries.status,
        source: schema.inquiries.source,
        product: schema.products.name,
        quantityRequested: schema.inquiries.quantityRequested,
        createdAt: schema.inquiries.createdAt,
      })
      .from(schema.inquiries)
      .leftJoin(schema.products, eq(schema.inquiries.productId, schema.products.id))
      .orderBy(desc(schema.inquiries.createdAt))
      .limit(10),
    dbs
      .select({
        id: schema.handoffs.id,
        conversationId: schema.handoffs.conversationId,
        status: schema.handoffs.status,
        priority: schema.handoffs.priority,
        reason: schema.handoffs.reason,
        aiSummary: schema.handoffs.aiSummary,
        createdAt: schema.handoffs.createdAt,
      })
      .from(schema.handoffs)
      .where(sql`${schema.handoffs.status} in ('NEW','QUEUED','ASSIGNED','IN_PROGRESS')`)
      .orderBy(desc(schema.handoffs.createdAt))
      .limit(8),
    dbs
      .select({
        name: schema.products.name,
        n: sql<number>`count(${schema.inquiries.id})::int`,
      })
      .from(schema.inquiries)
      .innerJoin(schema.products, eq(schema.inquiries.productId, schema.products.id))
      .groupBy(schema.products.name)
      .orderBy(sql`count(${schema.inquiries.id}) desc`)
      .limit(5),
    dbs
      .select({ source: schema.inquiries.source, n: sql<number>`count(*)::int` })
      .from(schema.inquiries)
      .groupBy(schema.inquiries.source)
      .orderBy(sql`count(*) desc`),
  ]);

  const now = new Date();
  const days: { label: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    days.push({ label: d.toLocaleDateString("en", { day: "numeric", month: "short" }), count: 0 });
  }
  const trend = await dbs
    .select({ day: sql<string>`to_char(date_trunc('day', ${schema.inquiries.createdAt}), 'YYYY-MM-DD')`, n: sql<number>`count(*)::int` })
    .from(schema.inquiries)
    .where(gte(schema.inquiries.createdAt, new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13)))
    .groupBy(sql`date_trunc('day', ${schema.inquiries.createdAt})`);
  for (const row of trend) {
    const dd = days.find((x) => {
      const parts = row.day.split("-");
      return x.label === new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))).toLocaleDateString("en", { day: "numeric", month: "short" });
    });
    if (dd) dd.count = row.n;
  }
  const maxTrend = Math.max(1, ...days.map((d) => d.count));

  const statusCounts = statuses.map((s, i) => ({ status: INQUIRY_STATUSES[i], count: s[0].n }));
  const totalInquiries = statusCounts.reduce((a, s) => a + s.count, 0);
  const maxStatus = Math.max(1, ...statusCounts.map((s) => s.count));

  const k = kpi[0];
  const cards = [
    { label: "Products", value: k.products, sub: `${k.liveProducts} live`, href: "/admin/products" },
    { label: "Customers", value: k.customers, sub: "CRM", href: "/admin/customers" },
    { label: "Inquiries", value: k.inquiries, sub: `${k.newInquiries} new`, href: "/admin/inquiries" },
    { label: "Open chats", value: k.openConvs, sub: `${k.openHandoffs} handoffs`, href: "/admin/chats" },
    { label: "Unread visitor msgs", value: k.unreadMsgs, sub: "awaiting reply", href: "/admin/chats" },
    { label: "Bot latency", value: k.avgReplyMs ? `${(k.avgReplyMs / 1000).toFixed(1)}s` : "—", sub: "avg AI reply", href: "/admin/chats" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-400">Welcome back, {user?.name}. Here is the business at a glance.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-accent/40">
            <p className="text-[11px] font-medium text-slate-400">{c.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-white">{c.value}</p>
            <p className="mt-0.5 text-[11px] text-slate-500">{c.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-lg font-bold text-white">Inquiries — last 14 days</h2>
          <div className="mt-4 flex h-40 items-end gap-1.5">
            {days.map((d, i) => (
              <div key={i} className="group flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-semibold text-accent">{d.count > 0 ? d.count : ""}</span>
                <div
                  className={`w-full rounded-t transition-all ${d.count > 0 ? "bg-gradient-to-t from-accent/70 to-accent" : "bg-white/5"}`}
                  style={{ height: `${Math.max(4, (d.count / maxTrend) * 100)}%` }}
                />
                <span className="hidden text-[9px] text-slate-500 sm:block">{d.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-lg font-bold text-white">Pipeline</h2>
          <div className="mt-4 space-y-3">
            {statusCounts.map((s) => (
              <div key={s.status}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">{s.status}</span>
                  <span className="text-slate-500">
                    {s.count}
                    {totalInquiries > 0 ? ` · ${Math.round((s.count / totalInquiries) * 100)}%` : ""}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/5">
                  <div className={`h-full rounded-full ${s.status === "CONVERTED" ? "bg-emerald-400" : "bg-accent/80"}`} style={{ width: `${(s.count / maxStatus) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Bot handoffs</h2>
            <Link href="/admin/chats" className="text-xs text-accent hover:underline">
              Open chats →
            </Link>
          </div>
          {openHandoffs.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">Nothing waiting. The bot is handling everything.</p>
          ) : (
            <ul className="mt-3 divide-y divide-white/5">
              {openHandoffs.map((h) => (
                <li key={h.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <Link href={`/admin/chats/${h.conversationId}`} className="truncate text-sm font-semibold text-slate-200 hover:text-accent">
                      {h.reason || "Visitor requested a human"}
                    </Link>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${h.priority === "HIGH" ? "bg-red-500/10 text-red-300" : "bg-amber-500/10 text-amber-300"}`}>
                      {h.priority}
                    </span>
                  </div>
                  {h.aiSummary ? <p className="mt-1 line-clamp-2 text-xs text-slate-500">{h.aiSummary}</p> : null}
                  <p className="mt-1 text-[11px] text-slate-600">{new Date(h.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-lg font-bold text-white">Top enquired products</h2>
          {topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No inquiries linked to products yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="w-5 text-sm font-bold text-slate-500">{i + 1}</span>
                  <span className="flex-1 text-sm text-slate-200">{p.name}</span>
                  <span className="text-sm font-semibold text-accent">{p.n}</span>
                </div>
              ))}
            </div>
          )}
          <h2 className="mt-6 text-lg font-bold text-white">Sources</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {sources.map((s) => (
              <span key={s.source} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300">
                {s.source} <b className="ml-1 text-white">{s.n}</b>
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Recent inquiries</h2>
            <Link href="/admin/inquiries" className="text-xs text-accent hover:underline">
              All →
            </Link>
          </div>
          {recentInquiries.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No inquiries yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-white/5">
              {recentInquiries.map((i) => (
                <li key={i.id} className="py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-200">{i.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[i.status]}`}>{i.status}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {[i.company, i.product, i.quantityRequested].filter(Boolean).join(" · ") || "—"}
                    <span className="text-slate-600"> · {new Date(i.createdAt).toLocaleString()}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-lg font-bold text-white">Low stock alerts</h2>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No low-stock items. Stock levels are healthy.</p>
          ) : (
            <ul className="mt-3 divide-y divide-white/5">
              {lowStock.map((r) => (
                <li key={`${r.name}-${r.warehouse}`} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <span className="font-semibold text-slate-200">{r.name}</span>
                    <span className="ml-2 text-xs text-slate-500">{r.warehouse}</span>
                  </div>
                  <span className="font-mono text-xs text-amber-300">
                    {r.quantity} {r.threshold ? `/ low at ${r.threshold}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
