import { TradeRoutes } from "./TradeRoutes";
import { Counter } from "@/components/motion/Counter";
import { RevealText } from "@/components/motion/RevealText";
import { MagneticButton } from "@/components/motion/MagneticButton";
import type { CompanyProfile } from "@/lib/content";

export function Hero({ profile }: { profile: CompanyProfile }) {
  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-ink text-white">
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -left-40 top-24 h-96 w-96 rounded-full bg-brand-3/25 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-accent/15 blur-[110px]" />

      <TradeRoutes />

      <div className="container-x relative z-10 flex min-h-[92vh] flex-col justify-center py-28 md:py-32">
        <p className="eyebrow flex items-center gap-2 text-accent">
          <span className="inline-block h-2 w-2 rounded-full bg-accent pulse-ring" />
          Import · Supply · Trust — since {profile.established ?? 2010}
        </p>

        <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl">
          <RevealText as="span" text="PVC raw materials," />
          <RevealText as="span" text="delivered with certainty." accentWords={["delivered", "with", "certainty."]} delay={0.15} />
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
          {profile.name} sources and supplies <strong className="text-white/90">PVC Resin, PVC Regrind, PET Resin and Calcium Carbonate</strong> to pipe, profile and
          fittings manufacturers across India — consistent grades, dependable supply, and a team that answers the phone.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <MagneticButton>
            <a href="/products" className="btn-primary btn-sheen px-7 py-3.5 text-sm">
              Explore products
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </MagneticButton>
          <MagneticButton>
            <a href="/contact" className="btn-ghost-dark px-7 py-3.5 text-sm">
              Request a quotation
            </a>
          </MagneticButton>
        </div>

        <div className="mt-16 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
          <div className="border-l-2 border-accent/60 pl-4">
            <div className="font-display text-3xl font-bold text-white sm:text-4xl">
              <Counter to={profile.established ?? 2010} />
            </div>
            <div className="mt-1 text-xs uppercase tracking-wide text-white/50">Established</div>
          </div>
          <div className="border-l-2 border-accent/60 pl-4">
            <div className="font-display text-3xl font-bold text-white sm:text-4xl">
              <Counter to={15} format suffix="+" />
            </div>
            <div className="mt-1 text-xs uppercase tracking-wide text-white/50">Years in PVC trade</div>
          </div>
          <div className="border-l-2 border-accent/60 pl-4">
            <div className="font-display text-3xl font-bold text-white sm:text-4xl">4</div>
            <div className="mt-1 text-xs uppercase tracking-wide text-white/50">Product lines</div>
          </div>
          <div className="border-l-2 border-accent/60 pl-4">
            <div className="font-display text-3xl font-bold text-white sm:text-4xl">All</div>
            <div className="mt-1 text-xs uppercase tracking-wide text-white/50">India supply</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40">
        <div className="flex h-9 w-5 items-start justify-center rounded-full border border-white/25 p-1.5">
          <div className="h-2 w-1 rounded-full bg-accent" />
        </div>
      </div>
    </section>
  );
}
