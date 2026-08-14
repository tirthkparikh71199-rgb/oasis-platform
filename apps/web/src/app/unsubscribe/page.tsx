import { notFound } from "next/navigation";
import { verifyToken } from "@oasis/messaging";
import { env } from "@oasis/config";

export const metadata = { title: "Unsubscribe | Oasis Impex" };

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ e?: string; t?: string; done?: string; resubscribed?: string; error?: string }> }) {
  const { e, t, done, resubscribed, error } = await searchParams;
  const email = e ? decodeURIComponent(e) : "";
  const token = t ? decodeURIComponent(t) : "";

  if (!email || !token) notFound();

  const secret = env().SESSION_SECRET;
  const valid = verifyToken(email, token, secret);

  if (done === "1") {
    return (
      <div className="min-h-screen bg-[#0B1320] text-slate-200 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-3xl">✓</div>
          <h1 className="mt-4 text-2xl font-bold text-white">You have been unsubscribed</h1>
          <p className="mt-2 text-sm text-slate-400">You will no longer receive marketing emails from Oasis Impex.</p>
          <a href="/" className="mt-6 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-accent/90">Back to site</a>
        </div>
      </div>
    );
  }

  if (resubscribed === "1") {
    return (
      <div className="min-h-screen bg-[#0B1320] text-slate-200 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-3xl">✓</div>
          <h1 className="mt-4 text-2xl font-bold text-white">Welcome back!</h1>
          <p className="mt-2 text-sm text-slate-400">You have been resubscribed.</p>
          <a href="/" className="mt-6 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-accent/90">Back to site</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1320] text-slate-200 flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-white">{valid ? "Unsubscribe from emails" : "Invalid link"}</h1>
        {error === "invalid" ? <p className="mt-2 text-sm text-red-400">This link is invalid or expired.</p> : null}
        {valid ? (
          <>
            <p className="mt-2 text-sm text-slate-400">Unsubscribe <span className="text-white font-medium">{email}</span> from Oasis Impex marketing emails?</p>
            <form method="POST" action="/api/unsubscribe" className="mt-6 space-y-3">
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="action" value="unsubscribe" />
              <button type="submit" className="w-full rounded-lg bg-red-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition">
                Unsubscribe me
              </button>
            </form>
            <p className="mt-4 text-xs text-slate-500">Changed your mind?
              <form method="POST" action="/api/unsubscribe" className="inline">
                <input type="hidden" name="email" value={email} />
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="action" value="resubscribe" />
                <button type="submit" className="text-accent hover:underline ml-1">Resubscribe</button>
              </form>
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-400">This unsubscribe link is invalid or has expired.</p>
        )}
        <a href="/" className="mt-6 inline-block text-sm text-slate-500 hover:text-white">← Back to site</a>
      </div>
    </div>
  );
}
