"use client";

import { createCustomer, updateCustomer } from "./actions";

interface CustomerInput {
  id?: string;
  name?: string | null;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  location?: string | null;
  industry?: string | null;
  notes?: string | null;
  status?: "LEAD" | "ACTIVE" | "INACTIVE" | null;
}

export function CustomerForm({ customer }: { customer?: CustomerInput }) {
  const isEdit = Boolean(customer?.id);
  return (
    <form action={isEdit ? updateCustomer : createCustomer} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">{isEdit ? "Edit customer" : "Add customer"}</h2>
      {customer?.id ? <input type="hidden" name="id" value={customer.id} /> : null}
      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="text-xs font-medium text-slate-300">Name *</span>
          <input
            name="name"
            required
            defaultValue={customer?.name ?? ""}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-300">Company</span>
          <input
            name="company"
            defaultValue={customer?.company ?? ""}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-medium text-slate-300">Email</span>
            <input
              name="email"
              type="email"
              defaultValue={customer?.email ?? ""}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-300">Phone</span>
            <input
              name="phone"
              defaultValue={customer?.phone ?? ""}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-300">WhatsApp</span>
            <input
              name="whatsapp"
              defaultValue={customer?.whatsapp ?? ""}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-300">Location</span>
            <input
              name="location"
              defaultValue={customer?.location ?? ""}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-xs font-medium text-slate-300">Industry</span>
          <input
            name="industry"
            defaultValue={customer?.industry ?? ""}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        {isEdit ? (
          <label className="block">
            <span className="text-xs font-medium text-slate-300">Status</span>
            <select
              name="status"
              defaultValue={customer?.status ?? "LEAD"}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
            >
              <option value="LEAD">LEAD</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </label>
        ) : null}
        <label className="block">
          <span className="text-xs font-medium text-slate-300">Notes</span>
          <textarea
            name="notes"
            defaultValue={customer?.notes ?? ""}
            rows={3}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-accent/90"
        >
          {isEdit ? "Save changes" : "Add customer"}
        </button>
      </div>
    </form>
  );
}
