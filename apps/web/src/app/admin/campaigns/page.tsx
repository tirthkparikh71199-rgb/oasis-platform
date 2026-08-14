import { desc } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { deleteCampaign } from "./actions";

export const metadata = { title: "Email Campaigns | Oasis Impex Admin" };

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-white/10 text-slate-300",
  SCHEDULED: "bg-blue-500/10 text-blue-300",
  SENDING: "bg-amber-500/10 text-amber-300",
  SENT: "bg-emerald-500/10 text-emerald-300",
  FAILED: "bg-red-500/10 text-red-300",
};

export default async function AdminCampaignsPage({ searchParams }: { searchParams: Promise<{ created?: string; error?: string }> }) {
  const user = await requireUser();
  requirePerm(user, "campaigns.read", "/admin");
  const { created, error } = await searchParams;

  const rows = await db()
    .select()
    .from(schema.campaigns)
    .orderBy(desc(schema.campaigns.createdAt));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Email campaigns</h1>
        <a href="/admin/campaigns/new" className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-accent/90">
          New campaign
        </a>
      </div>
      {created ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Campaign created.</p> : null}
      {error === "missing-fields" ? <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">Name, subject and body are required.</p> : null}
      <p className="mt-1 text-sm text-slate-400">Send product availability and company updates to your customers and leads by email. The worker delivers scheduled campaigns.</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
        {rows.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No campaigns yet. Create your first one.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Audience</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Delivery</th>
                <th className="px-4 py-3">Scheduled</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <a href={`/admin/campaigns/${c.id}`} className="font-semibold text-slate-200 hover:text-accent">
                      {c.name}
                    </a>
                    <p className="mt-0.5 line-clamp-1 max-w-[300px] text-xs text-slate-500">{c.subject}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.channel === "WHATSAPP" ? "bg-emerald-500/10 text-emerald-300" : "bg-blue-500/10 text-blue-300"}`}>
                      {c.channel === "WHATSAPP" ? "📱 WhatsApp" : "📧 Email"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {c.audience?.segment ?? "CUSTOMERS"}
                    {c.audience?.customerStatus ? ` · ${c.audience.customerStatus}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {c.sentCount}/{c.totalRecipients} sent
                    {c.failedCount > 0 ? <span className="text-red-300"> ({c.failedCount} failed)</span> : null}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {c.scheduledAt ? c.scheduledAt.toLocaleString("en-IN") : "—"}
                    {c.sentAt ? <span className="mt-0.5 block text-emerald-300">sent {c.sentAt.toLocaleString("en-IN")}</span> : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a href={`/admin/campaigns/${c.id}`} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white">
                        {c.status === "DRAFT" ? "Edit" : "View"}
                      </a>
                      <form action={deleteCampaign}>
                        <input type="hidden" name="id" value={c.id} />
                        <button className="rounded-lg border border-red-500/20 px-2.5 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/10">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
