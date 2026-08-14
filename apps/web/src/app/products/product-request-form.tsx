"use client";

import { FormEvent, useState } from "react";
import { track } from "@/lib/analytics";
import { requestNewProduct } from "./actions";

export function ProductRequestForm() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    track("generate_lead", { lead_type: "product_request" });
    setSent(true);
    e.currentTarget.requestSubmit();
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-brand/30 bg-brand/5 p-8 text-center">
        <p className="text-lg font-bold text-ink">Thank you — request received</p>
        <p className="mt-2 text-sm text-ink/60">Our team will check availability for this product and get back to you shortly.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between text-left">
        <span>
          <span className="block text-lg font-bold text-ink">Can&apos;t find what you need?</span>
          <span className="mt-1 block text-sm text-ink/55">Request a new product — we import on requirement and will check availability for you.</span>
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mist text-brand">{open ? "–" : "+"}</span>
      </button>

      {open && (
        <form action={requestNewProduct} onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold text-ink/70">Product you are looking for *</span>
            <input name="productName" required placeholder="e.g. Polypropylene Homopolymer (PPH)" className="mt-1.5 w-full rounded-xl border border-line bg-mist px-3.5 py-2.5 text-sm outline-none focus:border-brand-3" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink/70">Grade / specification</span>
            <input name="gradeSpec" placeholder="e.g. MFI 3.0, injection grade" className="mt-1.5 w-full rounded-xl border border-line bg-mist px-3.5 py-2.5 text-sm outline-none focus:border-brand-3" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold text-ink/70">Quantity</span>
              <input name="quantity" placeholder="e.g. 50" className="mt-1.5 w-full rounded-xl border border-line bg-mist px-3.5 py-2.5 text-sm outline-none focus:border-brand-3" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-ink/70">Unit</span>
              <input name="unit" placeholder="MT" className="mt-1.5 w-full rounded-xl border border-line bg-mist px-3.5 py-2.5 text-sm outline-none focus:border-brand-3" />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-semibold text-ink/70">Company</span>
            <input name="company" placeholder="Your company" className="mt-1.5 w-full rounded-xl border border-line bg-mist px-3.5 py-2.5 text-sm outline-none focus:border-brand-3" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-ink/70">Email *</span>
              <input name="email" type="email" required placeholder="you@company.com" className="mt-1.5 w-full rounded-xl border border-line bg-mist px-3.5 py-2.5 text-sm outline-none focus:border-brand-3" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-ink/70">Phone</span>
              <input name="phone" placeholder="+91 ..." className="mt-1.5 w-full rounded-xl border border-line bg-mist px-3.5 py-2.5 text-sm outline-none focus:border-brand-3" />
            </label>
          </div>
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold text-ink/70">Message</span>
            <textarea name="message" rows={3} placeholder="Tell us about your requirement…" className="mt-1.5 w-full rounded-xl border border-line bg-mist px-3.5 py-2.5 text-sm outline-none focus:border-brand-3" />
          </label>
          <button type="submit" className="sm:col-span-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-2">
            Submit request
          </button>
        </form>
      )}
    </div>
  );
}
