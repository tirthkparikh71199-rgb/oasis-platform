import Link from "next/link";
import type { CompanyProfile } from "@/lib/content";

const QUICK_LINKS = [
  { href: "/products", label: "PVC Resin" },
  { href: "/products", label: "PVC Regrind" },
  { href: "/products", label: "PET Resin" },
  { href: "/products", label: "Calcium Carbonate" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of use" },
];

export function Footer({ profile }: { profile: CompanyProfile }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-brand/20 blur-3xl" />

      <div className="container-x relative py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-3 to-brand-ink">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M3 9l9-5 9 5-9 5-9-5z" />
                  <path d="M3 9v6l9 5 9-5V9" />
                </svg>
              </span>
              <span className="font-display text-lg font-bold tracking-tight">
                {profile.name.split(" ")[0]} <span className="text-accent">{profile.name.split(" ").slice(1).join(" ")}</span>
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
              {profile.tagline}. Serving pipe, profile and fittings manufacturers across India since {profile.established ?? 2010}.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {profile.phones?.map((p) => (
                <a key={p} href={`tel:${p.replace(/[^+\d]/g, "")}`} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/75 transition hover:border-accent/50 hover:text-white">
                  {p}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="eyebrow text-white/50">Products</h4>
            <ul className="mt-4 space-y-2.5">
              {QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-white/70 transition hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="eyebrow text-white/50">Company</h4>
            <ul className="mt-4 space-y-2.5">
              {COMPANY_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-white/70 transition hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2 text-xs leading-relaxed text-white/45">
                {profile.offices?.[0]?.address}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/45">
            © {year} {profile.legalName ?? profile.name}. All rights reserved.
          </p>
          <p className="text-xs text-white/35">Importer of polymer raw materials · Ahmedabad, India</p>
        </div>
      </div>
    </footer>
  );
}
