import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { Hero } from "@/components/home/Hero";
import { ProductMarquee } from "@/components/home/ProductMarquee";
import { ProductCard } from "@/components/home/ProductCard";
import { SupplyChainFlow } from "@/components/home/SupplyChainFlow";
import { Reveal } from "@/components/motion/Reveal";
import { Counter } from "@/components/motion/Counter";
import { getCompanyProfile, getProducts, getCategories } from "@/lib/content";
import { getHomeContent } from "@/lib/site-content";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Oasis Impex — Importer & Trader of PVC Resin & PET Raw Materials",
  description:
    "Oasis Impex is an established Ahmedabad-based importer and trader of PVC Resin, PVC Regrind, PET Resin and Calcium Carbonate — trusted by pipe, profile and fittings manufacturers across India.",
};

export default async function HomePage() {
  const [profile, products, categories, home, vendors, testimonials, customers] = await Promise.all([
    getCompanyProfile(),
    getProducts({ publicOnly: true }),
    getCategories(),
    getHomeContent(),
    db().select({ name: schema.vendors.name, company: schema.vendors.company, country: schema.vendors.country }).from(schema.vendors).where(eq(schema.vendors.status, "ACTIVE")).orderBy(desc(schema.vendors.createdAt)).limit(12),
    db().select().from(schema.testimonials).where(eq(schema.testimonials.isPublished, true)).orderBy(schema.testimonials.sortOrder).limit(6),
    db().select({ name: schema.customers.name, company: schema.customers.company }).from(schema.customers).where(eq(schema.customers.status, "ACTIVE")).orderBy(desc(schema.customers.createdAt)).limit(8),
  ]);
  const catBySlug = new Map(categories.map((c) => [c.id, c.slug]));
  const featured = products.slice(0, 4);

  const isNum = (s: string) => /^-?\d+$/.test(s);
  const callLabel = home.cta.callLabel.replace("{phone}", profile.phones?.[0] ?? "");
  const callHref = profile.phones?.[0]?.replace(/[^+\d]/g, "") ?? "";

  return (
    <>
      <Hero home={home} />
      <ProductMarquee items={home.marquee} />

      <section className="grid-bg-light relative py-20 sm:py-24">
        <div className="container-x">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow text-brand">{home.productSection.eyebrow}</p>
                <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">{home.productSection.title}</h2>
              </div>
              <Link href="/products" className="btn-ghost px-5 py-2.5 text-sm">
                {home.productSection.ctaLabel}
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
              <p className="eyebrow text-accent">{home.supplyChain.eyebrow}</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">{home.supplyChain.title}</h2>
              <p className="mt-4 text-white/60">{home.supplyChain.text}</p>
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
              <p className="eyebrow text-brand">{home.whySection.eyebrow}</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">{home.whySection.title}</h2>
              <p className="mt-5 leading-relaxed text-ink/65">{home.whySection.text}</p>

              <div className="mt-8 grid grid-cols-2 gap-5">
                {home.whySection.stats.map((s) => (
                  <div key={s.label} className="rounded-2xl border border-line bg-white p-5 shadow-card">
                    <div className="font-display text-3xl font-extrabold text-brand">
                      {isNum(s.value) ? <Counter to={Number(s.value)} suffix={s.suffix} /> : `${s.value}${s.suffix}`}
                    </div>
                    <p className="mt-1 text-sm text-ink/55">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="flex h-full flex-col justify-center gap-4">
              {home.whySection.highlights.map((h) => (
                <div key={h.title} className="rounded-2xl border border-line bg-white p-6 shadow-card">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                    </span>
                    <div>
                      <h3 className="font-bold">{h.title}</h3>
                      <p className="text-sm text-ink/60">{h.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="border-y border-line bg-white py-20 sm:py-24">
          <div className="container-x">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <p className="eyebrow text-brand">Testimonials</p>
                <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">What Our Customers Say</h2>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <Reveal key={t.id} className="h-full">
                  <div className="card h-full p-6">
                    <div className="flex gap-1 text-brand">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} viewBox="0 0 20 20" className={`h-5 w-5 ${i < (t.rating ?? 5) ? "fill-current" : "fill-gray-200"}`}>
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-ink/70">&ldquo;{t.quote}&rdquo;</p>
                    <div className="mt-4 border-t border-line pt-3">
                      <p className="font-bold text-ink">{t.customerName}</p>
                      {t.company ? <p className="text-xs text-ink/50">{t.company}</p> : null}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {customers.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="container-x">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <p className="eyebrow text-brand">Our Customers</p>
                <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Trusted By Industry Leaders</h2>
              </div>
            </Reveal>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
              {customers.map((c, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <div className="flex h-20 w-40 items-center justify-center rounded-xl border border-line bg-white px-4 text-center shadow-card transition hover:shadow-lg">
                    <div>
                      <p className="text-sm font-bold text-ink">{c.name}</p>
                      {c.company ? <p className="text-xs text-ink/45">{c.company}</p> : null}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {vendors.length > 0 && (
        <section className="border-y border-line bg-white py-16 sm:py-20">
          <div className="container-x">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <p className="eyebrow text-brand">Our Vendors</p>
                <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Global Supply Partners</h2>
              </div>
            </Reveal>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
              {vendors.map((v, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <div className="flex h-16 w-36 items-center justify-center rounded-xl border border-line bg-mist px-3 text-center transition hover:shadow-md">
                    <div>
                      <p className="text-xs font-bold text-ink">{v.name}</p>
                      {v.country ? <p className="text-[10px] text-ink/40">{v.country}</p> : null}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-y border-line bg-white py-20 sm:py-24">
        <div className="container-x">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow text-brand">{home.process.eyebrow}</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">{home.process.title}</h2>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {home.process.steps.map((p, i) => (
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
              <h2 className="text-3xl font-extrabold sm:text-4xl">{home.cta.title}</h2>
              <p className="mt-4 text-white/60">{home.cta.text}</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/contact" className="btn-accent btn-sheen w-full px-7 py-3.5 text-sm sm:w-auto">
                  {home.cta.buttonLabel}
                </Link>
                <a href={`tel:${callHref}`} className="btn-ghost-dark w-full px-7 py-3.5 text-sm sm:w-auto">
                  {callLabel}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
