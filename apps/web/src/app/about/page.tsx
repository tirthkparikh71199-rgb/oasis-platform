import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { Counter } from "@/components/motion/Counter";
import { getCompanyProfile } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description:
    "Oasis Impex is an established Ahmedabad-based importer and supplier of PVC raw materials, operating since 2010 and serving pipe, profile and fittings manufacturers across India.",
};

export default async function AboutPage() {
  const profile = await getCompanyProfile();

  return (
    <>
      <section className="relative overflow-hidden bg-ink pt-32 pb-16 text-white">
        <div className="grid-bg pointer-events-none absolute inset-0" />
        <div className="container-x relative">
          <Reveal>
            <p className="eyebrow text-accent">About us</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">
              Built on supply you can build on
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Who we are</h2>
              <p className="mt-5 leading-relaxed text-ink/70">
                {profile.name} is a partnership firm based in Ahmedabad, Gujarat, importing and supplying PVC raw materials since {profile.established ?? 2010}. We focus on a few things and do them consistently well — PVC Resin, PVC Regrind, PET Resin and Calcium Carbonate.
              </p>
              <p className="mt-4 leading-relaxed text-ink/70">
                We are <strong>traders, not manufacturers</strong> — we don't run production lines. Our strength is trusted sourcing, logistics and long-standing relationships with established producers abroad, delivering to manufacturers across India.
              </p>
              <p className="mt-4 leading-relaxed text-ink/70">
                We operate with transparency: verifiable registrations, clear documentation, and a team that answers the phone.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-6">
                <div className="font-display text-3xl font-extrabold text-brand"><Counter to={profile.established ?? 2010} /></div>
                <p className="mt-1 text-sm text-ink/55">Founded</p>
              </div>
              <div className="card p-6">
                <div className="font-display text-3xl font-extrabold text-brand">~{profile.employees ?? 10}</div>
                <p className="mt-1 text-sm text-ink/55">People</p>
              </div>
              <div className="card p-6">
                <div className="font-display text-3xl font-extrabold text-brand">4</div>
                <p className="mt-1 text-sm text-ink/55">Product lines</p>
              </div>
              <div className="card p-6">
                <div className="font-display text-3xl font-extrabold text-brand">2</div>
                <p className="mt-1 text-sm text-ink/55">Core industries</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line bg-white py-16 sm:py-20">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow text-brand">Registrations</p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Verifiable, public record</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card p-6">
              <div className="text-xs uppercase tracking-wider text-ink/45">GSTIN</div>
              <div className="mt-2 font-mono text-lg font-semibold">{profile.gstin ?? "24AADFO1073E1ZQ"}</div>
            </div>
            <div className="card p-6">
              <div className="text-xs uppercase tracking-wider text-ink/45">Legal Entity Identifier</div>
              <div className="mt-2 font-mono text-lg font-semibold">{profile.lei ?? "3358006ILHHB8Z3KNT12"}</div>
            </div>
            <div className="card p-6">
              <div className="text-xs uppercase tracking-wider text-ink/45">AEO Certified</div>
              <div className="mt-2 font-mono text-lg font-semibold">{profile.aeo ?? "INAADFO1073E1F221"}</div>
            </div>
            <div className="card p-6">
              <div className="text-xs uppercase tracking-wider text-ink/45">Entity type</div>
              <div className="mt-2 text-lg font-semibold">Partnership firm</div>
            </div>
            <div className="card p-6">
              <div className="text-xs uppercase tracking-wider text-ink/45">Business type</div>
              <div className="mt-2 text-lg font-semibold">Trading company — Importer/Exporter</div>
            </div>
            <div className="card p-6">
              <div className="text-xs uppercase tracking-wider text-ink/45">Lead time</div>
              <div className="mt-2 text-lg font-semibold">~{profile.leadTime ?? "15"} days</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-white py-16 sm:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div>
              <p className="eyebrow text-brand">Sourcing &amp; logistics</p>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">How we trade</h2>
              <p className="mt-5 leading-relaxed text-ink/70">
                We source polymer raw materials from established producers across {(profile.markets ?? ["Southeast Asia"]).join(", ")}, import through Mundra port, and supply manufacturers throughout India. As a trading house, our job is dependable sourcing, documentation and delivery — not production.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="card p-5">
                  <div className="text-xs uppercase tracking-wider text-ink/45">Sourcing</div>
                  <p className="mt-2 text-sm text-ink/70">Southeast Asia &amp; global producers</p>
                </div>
                <div className="card p-5">
                  <div className="text-xs uppercase tracking-wider text-ink/45">Entry port</div>
                  <p className="mt-2 text-sm text-ink/70">Mundra, Gujarat — ICD Nava Sheva</p>
                </div>
                <div className="card p-5">
                  <div className="text-xs uppercase tracking-wider text-ink/45">Dispatch</div>
                  <p className="mt-2 text-sm text-ink/70">Trucks &amp; containers, all-India</p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Where we operate</h2>
              <div className="mt-6 space-y-4">
                <div className="card p-6">
                  <h3 className="font-bold text-brand">Head office</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">
                    {profile.offices?.[0]?.address ?? "510, City Center, Opp. Shukan Mall, Science City Road, Ahmedabad, Gujarat 380060"}
                  </p>
                </div>
                <div className="card p-6">
                  <h3 className="font-bold text-brand">Warehouse</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">
                    {profile.warehouse ?? "Shed 10 & 11, Mahalaxmi Industrial Compound, 806/P Kothari Industrial Estate, Santej, Kalol, Gandhinagar 382721"}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-ink/55">
                Registered under the LEI system (active), GST-registered in Gujarat, and authorized as an AEO (Authorized Economic Operator) — Importer/Exporter.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line py-16 sm:py-20">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow text-brand">The partnership</p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">The people behind the supply</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { name: "Keyur M. Parikh", role: "Co-promoter", note: "B.Sc (Chemistry); leads sourcing & trading." },
              { name: "Jinesh Patel", role: "Co-promoter · Sales", note: "Customer relationships & order management." },
              { name: "Kalpesh J. Patel", role: "Partner", note: "Operations & supplier relations." },
            ].map((p) => (
              <div key={p.name} className="card p-6">
                <div className="h-1 w-8 rounded bg-accent" />
                <h3 className="mt-4 font-bold">{p.name}</h3>
                <p className="text-sm font-semibold text-brand">{p.role}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">{p.note}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-ink/55">
            Public record: partnership active since {profile.established ?? 2010}, trading since 2011, fewer than 5 core team members, main markets Southeast Asia (95%) and North America (5%).
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="rounded-3xl bg-gradient-to-br from-brand-3 to-brand-ink p-8 text-white shadow-lift sm:p-10">
              <h2 className="text-2xl font-bold sm:text-3xl">Our focus</h2>
              <ul className="mt-6 space-y-4">
                {[
                  ["Consistency", "Grades and quality you can rely on batch after batch."],
                  ["Responsiveness", "Same-working-day quotes and a team that picks up the phone."],
                  ["Transparency", "Open documentation, verifiable registrations, clear terms."],
                  ["Relationships", "We grow with manufacturers, not just transactions."],
                ].map(([t, d]) => (
                  <li key={t} className="flex gap-3">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                    <span>
                      <strong className="font-semibold">{t}</strong>
                      <span className="block text-sm text-white/70">{d}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Who we serve</h2>
              <p className="mt-5 leading-relaxed text-ink/70">
                Our supply supports the industries where material consistency directly affects finished product quality:
              </p>
              <div className="mt-6 space-y-4">
                <div className="card p-6">
                  <h3 className="font-bold text-brand">Pipe, profile &amp; fittings manufacturers</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">
                    Rigid and drainage PVC pipes, profiles and fittings — where dependable PVC Resin supply keeps production lines moving.
                  </p>
                </div>
                <div className="card p-6">
                  <h3 className="font-bold text-brand">PVC compounders &amp; recyclers</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">
                    Flexible compounds, masterbatch and recycled-content lines — served with PVC Regrind and Calcium Carbonate grades.
                  </p>
                </div>
                <div className="card p-6">
                  <h3 className="font-bold text-brand">Water bottling &amp; beverage plants</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">
                    Bottle-grade PET Resin (IV 0.80) for drinking-water and beverage bottles and preforms, backed by food-contact certifications.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
