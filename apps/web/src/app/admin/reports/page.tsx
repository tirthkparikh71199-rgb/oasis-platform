import { sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";

export const metadata = { title: "Reports | Oasis Impex Admin" };

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const user = await requireUser();
  requirePerm(user, "analytics.read", "/admin");

  const [sales, inventory, customers, campaigns, inquiries, productRequests] = await Promise.all([
    // Sales summary (last 30 days)
    db().select({
      total: sql<number>`count(*)::int`,
      confirmed: sql<number>`count(*) filter (where status in ('CONFIRMED','IN_PROGRESS','SHIPPED','DELIVERED'))::int`,
      delivered: sql<number>`count(*) filter (where status = 'DELIVERED')::int`,
    }).from(schema.orders).where(sql`created_at > now() - interval '30 days'`),

    // Inventory summary
    db().select({
      totalProducts: sql<number>`count(distinct product_id)::int`,
      totalWarehouses: sql<number>`count(distinct warehouse_id)::int`,
      totalStock: sql<number>`coalesce(sum(quantity::numeric), 0)::numeric`,
      lowStock: sql<number>`count(*) filter (where low_stock_threshold is not null and quantity::numeric <= low_stock_threshold::numeric)::int`,
    }).from(schema.inventory),

    // Customer summary
    db().select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where status = 'ACTIVE')::int`,
      leads: sql<number>`count(*) filter (where status = 'LEAD')::int`,
      new30d: sql<number>`count(*) filter (where created_at > now() - interval '30 days')::int`,
    }).from(schema.customers),

    // Campaign summary
    db().select({
      total: sql<number>`count(*)::int`,
      sent: sql<number>`count(*) filter (where status = 'SENT')::int`,
      totalSent: sql<number>`coalesce(sum(sent_count), 0)::int`,
      totalFailed: sql<number>`coalesce(sum(failed_count), 0)::int`,
    }).from(schema.campaigns),

    // Inquiry summary
    db().select({
      total: sql<number>`count(*)::int`,
      new: sql<number>`count(*) filter (where status = 'NEW')::int`,
      converted: sql<number>`count(*) filter (where status = 'CONVERTED')::int`,
      new30d: sql<number>`count(*) filter (where created_at > now() - interval '30 days')::int`,
    }).from(schema.inquiries),

    // Product request summary
    db().select({
      total: sql<number>`count(*)::int`,
      pending: sql<number>`count(*) filter (where status in ('NEW','QUOTING'))::int`,
      fulfilled: sql<number>`count(*) filter (where status in ('ORDERED','AVAILABLE'))::int`,
    }).from(schema.productRequests),
  ]);

  const conversionRate = inquiries[0].total > 0 ? ((inquiries[0].converted / inquiries[0].total) * 100).toFixed(1) : "0";
  const campaignSuccessRate = campaigns[0].totalSent > 0 ? (((campaigns[0].totalSent - campaigns[0].totalFailed) / campaigns[0].totalSent) * 100).toFixed(1) : "0";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="mt-1 text-sm text-slate-400">Business performance overview. Last 30 days unless noted.</p>
        </div>
        <a href="/api/audit/export" className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:text-white">Export Audit Log</a>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Sales */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Sales (30d)</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Orders</span>
              <span className="font-bold text-white">{sales[0]?.total ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Confirmed</span>
              <span className="font-bold text-emerald-300">{sales[0]?.confirmed ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Delivered</span>
              <span className="font-bold text-blue-300">{sales[0]?.delivered ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Inventory</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Products Tracked</span>
              <span className="font-bold text-white">{inventory[0]?.totalProducts ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Warehouses</span>
              <span className="font-bold text-white">{inventory[0]?.totalWarehouses ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Stock</span>
              <span className="font-bold text-white">{Number(inventory[0]?.totalStock ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Low Stock Items</span>
              <span className={`font-bold ${(inventory[0]?.lowStock ?? 0) > 0 ? "text-red-300" : "text-emerald-300"}`}>{inventory[0]?.lowStock ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Customers */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Customers</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total</span>
              <span className="font-bold text-white">{customers[0]?.total ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Active</span>
              <span className="font-bold text-emerald-300">{customers[0]?.active ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Leads</span>
              <span className="font-bold text-amber-300">{customers[0]?.leads ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">New (30d)</span>
              <span className="font-bold text-blue-300">{customers[0]?.new30d ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Inquiries */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Inquiries</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total</span>
              <span className="font-bold text-white">{inquiries[0]?.total ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">New</span>
              <span className="font-bold text-sky-300">{inquiries[0]?.new ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Converted</span>
              <span className="font-bold text-emerald-300">{inquiries[0]?.converted ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Conversion Rate</span>
              <span className="font-bold text-accent">{conversionRate}%</span>
            </div>
          </div>
        </div>

        {/* Campaigns */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Campaigns</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Campaigns</span>
              <span className="font-bold text-white">{campaigns[0]?.total ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Sent</span>
              <span className="font-bold text-emerald-300">{campaigns[0]?.sent ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Emails/WhatsApp Sent</span>
              <span className="font-bold text-white">{campaigns[0]?.totalSent ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Success Rate</span>
              <span className="font-bold text-accent">{campaignSuccessRate}%</span>
            </div>
          </div>
        </div>

        {/* Product Requests */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Product Requests</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total</span>
              <span className="font-bold text-white">{productRequests[0]?.total ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Pending</span>
              <span className="font-bold text-amber-300">{productRequests[0]?.pending ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Fulfilled</span>
              <span className="font-bold text-emerald-300">{productRequests[0]?.fulfilled ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
