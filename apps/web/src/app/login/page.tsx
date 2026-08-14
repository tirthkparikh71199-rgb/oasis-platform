import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in | Oasis Impex Admin", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B1320] px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent font-black text-slate-950">O</span>
          <span className="font-extrabold tracking-tight text-white">
            Oasis<span className="text-accent"> Impex</span>
          </span>
        </Link>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl">
          <h1 className="text-xl font-bold text-white">Sign in</h1>
          <p className="mt-1 text-sm text-slate-400">Access the internal sales &amp; inventory console.</p>
          <LoginForm />
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">
          Authorized staff only. All activity is logged.{" "}
          <Link href="/" className="underline hover:text-slate-300">
            Back to site
          </Link>
        </p>
      </div>
    </main>
  );
}
