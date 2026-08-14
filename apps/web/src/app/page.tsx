import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { ProductMarquee } from "@/components/home/ProductMarquee";
import { ProductCard } from "@/components/home/ProductCard";
import { SupplyChainFlow } from "@/components/home/SupplyChainFlow";
import { Reveal } from "@/components/motion/Reveal";
import { Counter } from "@/components/motion/Counter";
import { getCompanyProfile, getProducts, getCategories } from "@/lib/content";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Importer of Polymer Raw Materials",
  description:
    "Oasis Impex is an established Ahmedabad-based importer and supplier of PVC Resin, PVC Regrind and Calcium Carbonate — trusted by pipe, profile and fittings manufacturers across India.",
};

const PROCESS = [
  { step: "01", title: "Enquire", text: "Tell us your grade, quantity and destination — by phone, WhatsApp, email or the chat assistant." },
  { step: "02", title: "Get a quote", text: "Our sales team responds with a firm price and availability, usually the same working day." },
  { step: "03", title: "Supply", text: "We coordinate quality, packaging and pan-India dispatch from our Ahmedabad operations." },
  { step: "04", title: "Support", text: "Consistent follow-ups, documentation and a team that stays with you order after order." },
];

export default async function HomePage() {
  const [profile, products, categories] = await Promise.all([getCompanyProfile(), getProducts({ publicOnly: true }), getCategories()]);
  const catBySlug = new Map(categories.map((c) => [c.id, c.slug]));
  const featured = products.slice(0, 4);

  return (
    <>
      <Hero profile={profile} />
      <ProductMarquee />

      <section className="grid-bg-light relative py-20 sm:py-24">
        <div className="container-x">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow text-brand">Product range</p>
                <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                  What we supply
                </h2>
              </div>
              <Link href="/products" className="btn-ghost px-5 py-2.5 text-sm">
                View full catalogue
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} categorySlug={catBySlug.get(p.categoryId ?? "")} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-20 text-white sm:py-28">
        <div className="container-x">
          <Reveal>
            <div className="max-w-2xl">
              <p className="eyebrow text-accent">How we operate</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                From global sources to your production line
              </h2>
              <p className="mt-4 text-white/60">
                Drag the nodes — this is a live view of our sourcing and supply model. We import from established producers and supply manufacturers across India.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-10">
              <SupplyChainFlow />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div>
              <p className="eyebrow text-brand">Why Oasis Impex</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                A supplier your production can rely on
              </h2>
              <p className="mt-5 leading-relaxed text-ink/65">
                Since {profile.established ?? 2010}, we've built our business on one idea — dependable raw material supply. We don't chase volume; we build relationships with manufacturers who need consistency.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-5">
                <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
                  <div className="font-display text-3xl font-extrabold text-brand">
                    <Counter to={profile.established ?? 2010} />
                  </div>
                  <p className="mt-1 text-sm text-ink/55">Established and continuously operating</p>
                </div>
                <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
                  <div className="font-display text-3xl font-extrabold text-brand">
                    <Counter to={4} suffix="+" />
                  </div>
                  <p className="mt-1 text-sm text-ink/55">Core product lines, multiple grades</p>
                </div>
                <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
                  <div className="font-display text-3xl font-extrabold text-brand">Pan-India</div>
                  <p className="mt-1 text-sm text-ink/55">Dispatch coverage across the country</p>
                </div>
                <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
                  <div className="font-display text-3xl font-extrabold text-brand">2</div>
                  <p className="mt-1 text-sm text-ink/55">Core industries served</p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="flex h-full flex-col justify-center gap-4">
              <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-bold">Registered &amp; verifiable</h3>
                    <p className="text-sm text-ink/60">GSTIN 24AADFO1073E1ZQ · LEI 3358006ILHHB8Z3KNT12</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <circle cx="12" cy="12" r="9" />
                      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-bold">International sourcing</h3>
                    <p className="text-sm text-ink/60">Established producer relationships across Asia, the Middle East and Europe</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-bold">Quality you can verify</h3>
                    <p className="text-sm text-ink/60">Product documentation and certificates shared transparently before supply</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-line bg-white py-20 sm:py-24">
        <div className="container-x">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow text-brand">How it works</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">From inquiry to dispatch</h2>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p, i) => (
              <Reveal key={p.step} delay={i * 0.08} className="h-full">
                <div className="card card-hover h-full p-6">
                  <div className="font-display text-4xl font-extrabold text-brand/15">{p.step}</div>
                  <h3 className="mt-4 font-bold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink py-20 text-white sm:py-24">
        <div className="grid-bg pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-brand/30 blur-[110px]" />
        <div className="container-x relative">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-extrabold sm:text-4xl">
                Ready to secure your raw material supply?
              </h2>
              <p className="mt-4 text-white/60">
                Share your requirement and get a firm quotation from our sales team — usually the same working day.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/contact" className="btn-accent btn-sheen w-full px-7 py-3.5 text-sm sm:w-auto">
                  Request a quotation
                </Link>
                <a href={`tel:${profile.phones?.[0]?.replace(/[^+\d]/g, "") ?? ""}`} className="btn-ghost-dark w-full px-7 py-3.5 text-sm sm:w-auto">
                  Call {profile.phones?.[0]}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
