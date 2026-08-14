"use client";

import { useState } from "react";

export function ProductRequestStatusLookup() {
  const [email, setEmail] = useState("");
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    setRequests([]);

    try {
      const res = await fetch(`/api/product-requests/status?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not find requests for this email.");
        return;
      }
      setRequests(data.requests || []);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const statusStyle: Record<string, string> = {
    NEW: "bg-sky-500/10 text-sky-300",
    QUOTING: "bg-violet-500/10 text-violet-300",
    ORDERED: "bg-blue-500/10 text-blue-300",
    AVAILABLE: "bg-emerald-500/10 text-emerald-300",
    DECLINED: "bg-slate-500/10 text-slate-400",
  };

  return (
    <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
      <h2 className="text-lg font-bold text-ink">Check your request status</h2>
      <p className="mt-1 text-sm text-ink/55">Enter the email you used when submitting your request.</p>
      
      <form onSubmit={handleSearch} className="mt-4 flex gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          className="flex-1 rounded-xl border border-line bg-mist px-3.5 py-2.5 text-sm outline-none focus:border-brand-3"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-2 disabled:opacity-60"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {requests.length > 0 && (
        <div className="mt-6 space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="rounded-xl border border-line bg-mist/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-ink">{r.productName}</h3>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[r.status] || "bg-white/10 text-slate-400"}`}>
                  {r.status}
                </span>
              </div>
              {r.gradeSpec && <p className="mt-1 text-sm text-ink/60">Grade: {r.gradeSpec}</p>}
              {r.quantity && <p className="text-sm text-ink/60">Qty: {r.quantity} {r.unit || ""}</p>}
              <p className="mt-2 text-xs text-ink/40">Submitted: {new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
            </div>
          ))}
        </div>
      )}

      {requests.length === 0 && !loading && !error && email && (
        <p className="mt-4 text-sm text-ink/55">No requests found for this email address.</p>
      )}
    </div>
  );
}
