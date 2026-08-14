"use client";

import { updateInquiryStatus } from "./actions";

interface InquiryCardProps {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  quantityRequested: string | null;
  message: string | null;
  source: string;
  status: string;
  product: string | null;
  createdAt: Date;
}

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-sky-500/10 text-sky-300",
  CONTACTED: "bg-violet-500/10 text-violet-300",
  QUALIFIED: "bg-blue-500/10 text-blue-300",
  IN_PROGRESS: "bg-amber-500/10 text-amber-300",
  CONVERTED: "bg-emerald-500/10 text-emerald-300",
  CLOSED: "bg-slate-500/10 text-slate-400",
};

export function InquiryCard(props: InquiryCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-100">{props.name}</span>
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-400">{props.source}</span>
            {props.product ? (
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">{props.product}</span>
            ) : null}
            {props.quantityRequested ? (
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">Qty: {props.quantityRequested}</span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {[props.company, props.email, props.phone].filter(Boolean).join(" · ") || "—"} · {new Date(props.createdAt).toLocaleString()}
          </p>
          {props.message ? <p className="mt-2 line-clamp-3 text-sm text-slate-300">{props.message}</p> : null}
        </div>
        <form action={updateInquiryStatus} className="flex items-center gap-2">
          <input type="hidden" name="id" value={props.id} />
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[props.status]}`}>{props.status}</span>
          <select
            name="status"
            defaultValue={props.status}
            onChange={(e) => e.target.form?.requestSubmit()}
            className="rounded-lg border border-white/10 bg-slate-950/60 px-2 py-1.5 text-xs text-white outline-none focus:border-accent"
          >
            <option>NEW</option>
            <option>CONTACTED</option>
            <option>QUALIFIED</option>
            <option>IN_PROGRESS</option>
            <option>CONVERTED</option>
            <option>CLOSED</option>
          </select>
        </form>
      </div>
    </div>
  );
}
