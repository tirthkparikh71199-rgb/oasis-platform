import { getUsageStats } from "./actions";
import { requirePerm, requireUser } from "@/lib/auth";
import { setConversationCap } from "./actions";

export const metadata = { title: "Usage & Billing | Oasis Impex Admin" };

export const dynamic = "force-dynamic";

export default async function AdminUsagePage({ searchParams }: { searchParams: Promise<{ updated?: string }> }) {
  const user = await requireUser();
  requirePerm(user, "analytics.read", "/admin");
  const { updated } = await searchParams;
  const stats = await getUsageStats();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Usage & Billing</h1>
      <p className="mt-1 text-sm text-slate-400">Monitor conversation usage and costs. Service conversations (AI) are FREE UNLIMITED.</p>
      {updated ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Settings updated.</p> : null}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Service Conversations - FREE */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-300">{stats.service.label}</h2>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300">FREE</span>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Used this month</span>
              <span className="font-bold text-white text-2xl">{stats.service.used.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Limit</span>
              <span className="font-bold text-emerald-300">UNLIMITED</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Cost</span>
              <span className="font-bold text-emerald-300">₹0</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-emerald-200/60">Service conversations (AI answering questions) are free and unlimited in India.</p>
        </div>

        {/* Marketing Conversations */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">{stats.marketing.label}</h2>
            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-300">₹0.73/conv</span>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Used this month</span>
              <span className="font-bold text-white">{stats.marketing.used.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Free limit</span>
              <span className="font-bold text-blue-300">{stats.marketing.limit.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Remaining</span>
              <span className="font-bold text-emerald-300">{stats.marketing.remaining.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Cost</span>
              <span className={`font-bold ${stats.marketing.cost > 0 ? "text-red-300" : "text-emerald-300"}`}>
                ₹{stats.marketing.cost.toFixed(2)}
              </span>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">First 1,000 marketing conversations free. After that ₹0.73 each.</p>
        </div>

        {/* Handoffs */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">{stats.handoffs.label}</h2>
            <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-300">FREE</span>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total this month</span>
              <span className="font-bold text-white">{stats.handoffs.total.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Pending (need reply)</span>
              <span className={`font-bold ${stats.handoffs.pending > 0 ? "text-amber-300" : "text-emerald-300"}`}>
                {stats.handoffs.pending.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Cost</span>
              <span className="font-bold text-emerald-300">₹0</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Handoffs are service conversations — always free.</p>
        </div>
      </div>

      {/* Total Cost */}
      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Total Cost This Month</h2>
            <p className="text-sm text-slate-400">{stats.month}</p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-extrabold ${stats.totalCost > 0 ? "text-red-300" : "text-emerald-300"}`}>
              ₹{stats.totalCost.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500">
              {stats.totalCost === 0 ? "All free — no charges" : `₹${stats.marketing.cost.toFixed(2)} for ${stats.marketing.used - 1000} extra marketing convs`}
            </p>
          </div>
        </div>
      </div>

      {/* Cap Settings */}
      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Marketing Cap</h2>
        <p className="mt-1 text-xs text-slate-500">Stop AI from sending marketing messages after this limit. Service conversations always continue.</p>
        <form action={setConversationCap} className="mt-4 flex items-center gap-3">
          <label className="block">
            <span className="text-xs font-medium text-slate-300">Max marketing conversations/month</span>
            <input name="cap" type="number" defaultValue={1000} min={0} className="mt-1.5 w-48 rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
          </label>
          <button className="mt-5 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-accent/90">Save</button>
        </form>
      </div>
    </div>
  );
}
