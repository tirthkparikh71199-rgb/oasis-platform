"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ContactFormInner() {
  const params = useSearchParams();
  const prefill = params.get("product") ?? "";
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) {
        setStatus("error");
        setError(body.error ?? "Please check the form and try again.");
        return;
      }
      setStatus("success");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
      setError("Network error. Please try again or call us directly.");
    }
  }

  if (status === "success") {
    return (
      <div className="card flex flex-col items-center p-10 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
        <h2 className="mt-4 text-2xl font-bold">Inquiry received</h2>
        <p className="mt-2 max-w-sm text-sm text-ink/60">
          Thank you — our sales team will get back to you shortly. For urgent requirements call us directly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Full name *</span>
          <input name="name" required minLength={2} placeholder="Your name" className="w-full rounded-xl border border-line bg-mist px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-3 focus:ring-2 focus:ring-brand-3/20" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Company</span>
          <input name="company" placeholder="Company name" className="w-full rounded-xl border border-line bg-mist px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-3 focus:ring-2 focus:ring-brand-3/20" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Phone *</span>
          <input name="phone" required minLength={7} type="tel" placeholder="+91 …" className="w-full rounded-xl border border-line bg-mist px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-3 focus:ring-2 focus:ring-brand-3/20" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <input name="email" type="email" placeholder="you@company.in" className="w-full rounded-xl border border-line bg-mist px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-3 focus:ring-2 focus:ring-brand-3/20" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">WhatsApp</span>
          <input name="whatsapp" placeholder="+91 …" className="w-full rounded-xl border border-line bg-mist px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-3 focus:ring-2 focus:ring-brand-3/20" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Quantity required</span>
          <input name="quantityRequested" placeholder="e.g. 25 MT / month" defaultValue={prefill ? "" : undefined} className="w-full rounded-xl border border-line bg-mist px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-3 focus:ring-2 focus:ring-brand-3/20" />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium">Message *</span>
          <textarea name="message" required minLength={10} rows={4} placeholder="Tell us what you need — grade, quantity, destination…" className="w-full resize-y rounded-xl border border-line bg-mist px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-3 focus:ring-2 focus:ring-brand-3/20" />
        </label>
      </div>

      {prefill && (
        <p className="mt-4 rounded-xl bg-brand/5 px-4 py-2.5 text-sm text-brand">
          Enquiring about: <strong>{prefill.replace(/-/g, " ")}</strong>
        </p>
      )}

      {status === "error" && <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={status === "sending"} className="btn-primary mt-6 w-full px-5 py-3.5 text-sm disabled:opacity-60 sm:w-auto">
        {status === "sending" ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}

export function ContactForm() {
  return (
    <Suspense fallback={<div className="card h-96 animate-pulse" />}>
      <ContactFormInner />
    </Suspense>
  );
}
