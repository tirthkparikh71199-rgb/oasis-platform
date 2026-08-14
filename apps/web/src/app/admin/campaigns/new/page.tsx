import { requirePerm, requireUser } from "@/lib/auth";
import { createCampaign } from "../actions";

export const metadata = { title: "New Campaign | Oasis Impex Admin" };

export default async function NewCampaignPage() {
  const user = await requireUser();
  requirePerm(user, "campaigns.write", "/admin/campaigns");
  const now = new Date(Date.now() + 60 * 60_000).toISOString().slice(0, 16);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">New campaign</h1>
      <p className="mt-1 text-sm text-slate-400">Send product availability and updates to your customers and leads via email or WhatsApp.</p>

      <form action={createCampaign} className="mt-6 max-w-3xl space-y-6">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Message</h2>
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-slate-300">Campaign name *</span>
                <input name="name" required placeholder="e.g. August PVC availability update" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-300">Channel *</span>
                <select name="channel" defaultValue="EMAIL" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent">
                  <option value="EMAIL">Email</option>
                  <option value="WHATSAPP">WhatsApp</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Subject (for email) / Title (for WhatsApp) *</span>
              <input name="subject" required placeholder="PVC Resin K67 & PET — August availability" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Body *</span>
              <textarea name="body" required rows={10} placeholder={"Dear customer,\n\nWe are pleased to share our latest product availability...\n\nRegards,\nOasis Impex"} className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-accent" />
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Audience & schedule</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Audience</span>
              <select name="segment" defaultValue="CUSTOMERS" className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent">
                <option value="CUSTOMERS">Saved customers</option>
                <option value="LEADS">Leads & inquiries</option>
                <option value="SUBSCRIBERS">Newsletter subscribers</option>
                <option value="ALL">Everyone</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Send time (optional — empty saves as draft)</span>
              <input name="schedule" type="datetime-local" defaultValue={now} className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
            </label>
          </div>
          <p className="mt-3 text-xs text-slate-500">Recipients are collected from saved customer emails/phones, inquiry contacts, and newsletter subscribers. Duplicates are removed. Unsubscribed and blocked contacts are excluded.</p>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-accent/90">
            Create campaign
          </button>
          <a href="/admin/campaigns" className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-slate-300 hover:text-white">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
