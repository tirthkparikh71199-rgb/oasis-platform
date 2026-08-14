import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { deleteCampaign, scheduleCampaign, sendNow, updateCampaign } from "../actions";

export const metadata = { title: "Campaign | Oasis Impex Admin" };

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-white/10 text-slate-300",
  SCHEDULED: "bg-blue-500/10 text-blue-300",
  SENDING: "bg-amber-500/10 text-amber-300",
  SENT: "bg-emerald-500/10 text-emerald-300",
  FAILED: "bg-red-500/10 text-red-300",
};

export default async function CampaignDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; scheduled?: string; queued?: string; error?: string }> }) {
  const user = await requireUser();
  requirePerm(user, "campaigns.read", "/admin/campaigns");
  const { id } = await params;
  const { saved, scheduled, queued, error } = await searchParams;

  const [campaign] = await db().select().from(schema.campaigns).where(eq(schema.campaigns.id, id)).limit(1);
  if (!campaign) notFound();

  const recipients = await db()
    .select()
    .from(schema.campaignRecipients)
    .where(eq(schema.campaignRecipients.campaignId, id))
    .orderBy(desc(schema.campaignRecipients.sentAt))
    .limit(200);
  const locked = campaign.status !== "DRAFT";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{campaign.name}</h1>
          <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[campaign.status]}`}>{campaign.status}</span>
        </div>
        <div className="flex items-center gap-2">
          {!locked ? (
            <form action={sendNow}>
              <input type="hidden" name="id" value={campaign.id} />
              <button className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-accent/90">Send now</button>
            </form>
          ) : null}
          <form action={deleteCampaign}>
            <input type="hidden" name="id" value={campaign.id} />
            <button className="rounded-lg border border-red-500/20 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10">Delete</button>
          </form>
        </div>
      </div>

      {saved ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Saved.</p> : null}
      {scheduled ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Scheduled. The worker will send it at the set time.</p> : null}
      {queued ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Queued — the worker will send it within a minute.</p> : null}
      {error === "sent-locked" ? <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">This campaign already started sending and is locked.</p> : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Message</h2>
          <form action={updateCampaign} className="mt-4 space-y-4">
            <input type="hidden" name="id" value={campaign.id} />
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Campaign name</span>
              <input name="name" defaultValue={campaign.name} readOnly={locked} className={`mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent ${locked ? "opacity-60" : ""}`} />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Subject</span>
              <input name="subject" defaultValue={campaign.subject} readOnly={locked} className={`mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent ${locked ? "opacity-60" : ""}`} />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Body</span>
              <textarea name="body" defaultValue={campaign.body} readOnly={locked} rows={12} className={`mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-accent ${locked ? "opacity-60" : ""}`} />
            </label>
            {!locked ? (
              <button type="submit" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-accent/90">
                Save changes
              </button>
            ) : null}
          </form>

          {!locked ? (
            <form action={scheduleCampaign} className="mt-6 border-t border-white/10 pt-5">
              <input type="hidden" name="id" value={campaign.id} />
              <label className="block">
                <span className="text-xs font-medium text-slate-300">Schedule send time</span>
                <div className="mt-1.5 flex items-center gap-2">
                  <input name="schedule" type="datetime-local" className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
                  <button className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:text-white">Schedule</button>
                </div>
              </label>
            </form>
          ) : null}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Delivery</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Recipients</span>
              <span className="font-bold text-white">{campaign.totalRecipients}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Sent</span>
              <span className="font-bold text-emerald-300">{campaign.sentCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Failed</span>
              <span className={`font-bold ${campaign.failedCount > 0 ? "text-red-300" : "text-slate-300"}`}>{campaign.failedCount}</span>
            </div>
            {campaign.scheduledAt ? (
              <div className="border-t border-white/10 pt-3 text-xs text-slate-500">
                Scheduled: {campaign.scheduledAt.toLocaleString("en-IN")}
              </div>
            ) : null}
          </div>
          <h3 className="mt-6 text-xs font-bold uppercase tracking-wide text-slate-400">Recipients (up to 200)</h3>
          <div className="mt-2 max-h-64 overflow-y-auto space-y-1.5 text-xs">
            {recipients.length === 0 ? <p className="text-slate-500">No recipients collected yet.</p> : null}
            {recipients.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg bg-slate-950/40 px-2.5 py-1.5">
                <span className="text-slate-300">{r.email}</span>
                <span className={r.status === "SENT" ? "text-emerald-300" : r.status === "FAILED" ? "text-red-300" : "text-slate-500"}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
