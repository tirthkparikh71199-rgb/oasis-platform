import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { getCompanyProfile } from "@/lib/content";
import { getAboutContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description:
    "Oasis Impex is an established Ahmedabad-based importer and supplier of PVC raw materials, operating since 2010 and serving pipe, profile and fittings manufacturers across India.",
};

export default async function AboutPage() {
  const [profile, about] = await Promise.all([getCompanyProfile(), getAboutContent()]);
  const headOffice = profile.offices?.[0]?.address ?? "510, City Center, Opp. Shukan Mall, Science City Road, Ahmedabad, Gujarat 380060";
  const warehouse = profile.warehouse ?? "Shed 10 & 11, Mahalaxmi Industrial Compound, 806/P Kothari Industrial Estate, Santej, Kalol, Gandhinagar 382721";

  return (
    <>
      <section className="relative overflow-hidden bg-ink pt-32 pb-16 text-white">
        <div className="grid-bg pointer-events-none absolute inset-0" />
        <div className="container-x relative">
          <Reveal>
            <p className="eyebrow text-accent">{about.hero.eyebrow}</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">{about.hero.title}</h1>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">{about.whoWeAre.title}</h2>
              {about.whoWeAre.paragraphs.map((p, i) => (
                <p key={i} className="mt-5 leading-relaxed text-ink/70">
                  {p.replace("{name}", profile.name).replace("{established}", String(profile.established ?? 2010))}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 gap-4">
              {about.stats.map((s) => (
                <div key={s.label} className="card p-6">
                  <div className="font-display text-3xl font-extrabold text-brand">{s.value}</div>
                  <p className="mt-1 text-sm text-ink/55">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line bg-white py-16 sm:py-20">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow text-brand">{about.registrations.eyebrow}</p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{about.registrations.title}</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {about.registrations.cards.map((c) => (
              <div key={c.label} className="card p-6">
                <div className="text-xs uppercase tracking-wider text-ink/45">{c.label}</div>
                <div className="mt-2 font-mono text-lg font-semibold">
                  {c.value.replace("{gstin}", profile.gstin ?? "").replace("{lei}", profile.lei ?? "").replace("{aeo}", profile.aeo ?? "")}
                </div>
              </div>
            ))}
          </div>
          {about.registrations.note ? <p className="mt-6 max-w-3xl text-sm text-ink/55">{about.registrations.note}</p> : null}
        </div>
      </section>

      <section className="border-t border-line bg-white py-16 sm:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div>
              <p className="eyebrow text-brand">{about.trade.eyebrow}</p>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{about.trade.title}</h2>
              <p className="mt-5 leading-relaxed text-ink/70">
                {about.trade.text.replace("{markets}", (profile.markets ?? ["Southeast Asia"]).join(", "))}
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {about.trade.cards.map((c) => (
                  <div key={c.label} className="card p-5">
                    <div className="text-xs uppercase tracking-wider text-ink/45">{c.label}</div>
                    <p className="mt-2 text-sm text-ink/70">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">{about.locations.title}</h2>
              <div className="mt-6 space-y-4">
                <div className="card p-6">
                  <h3 className="font-bold text-brand">{about.locations.headOfficeTitle}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{headOffice}</p>
                </div>
                <div className="card p-6">
                  <h3 className="font-bold text-brand">{about.locations.warehouseTitle}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{warehouse}</p>
                </div>
              </div>
              {about.locations.note ? <p className="mt-4 text-sm text-ink/55">{about.locations.note}</p> : null}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line py-16 sm:py-20">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow text-brand">{about.team.eyebrow}</p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{about.team.title}</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {about.team.members.map((m) => (
              <div key={m.name} className="card p-6">
                <div className="h-1 w-8 rounded bg-accent" />
                <h3 className="mt-4 font-bold">{m.name}</h3>
                <p className="text-sm font-semibold text-brand">{m.role}</p>
                {m.note ? <p className="mt-2 text-sm leading-relaxed text-ink/60">{m.note}</p> : null}
              </div>
            ))}
          </div>
          {about.team.footerNote ? (
            <p className="mt-6 text-sm text-ink/55">{about.team.footerNote.replace("{established}", String(profile.established ?? 2010))}</p>
          ) : null}
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="rounded-3xl bg-gradient-to-br from-brand-3 to-brand-ink p-8 text-white shadow-lift sm:p-10">
              <h2 className="text-2xl font-bold sm:text-3xl">{about.focus.title}</h2>
              <ul className="mt-6 space-y-4">
                {about.focus.values.map((v) => (
                  <li key={v.title} className="flex gap-3">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                    <span>
                      <strong className="font-semibold">{v.title}</strong>
                      <span className="block text-sm text-white/70">{v.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">{about.whoWeServe.title}</h2>
              <p className="mt-5 leading-relaxed text-ink/70">{about.whoWeServe.text}</p>
              <div className="mt-6 space-y-4">
                {about.whoWeServe.segments.map((s) => (
                  <div key={s.title} className="card p-6">
                    <h3 className="font-bold text-brand">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/60">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
