import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { Reveal } from "@/components/motion/Reveal";
import { getCompanyProfile, getContactSettings } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Oasis Impex for PVC Resin, PET Resin, PVC Regrind and Calcium Carbonate. Call, email or send an inquiry — our sales team responds the same working day.",
};

export default async function ContactPage() {
  const [profile, contact] = await Promise.all([getCompanyProfile(), getContactSettings()]);

  return (
    <>
      <section className="relative overflow-hidden bg-ink pt-32 pb-16 text-white">
        <div className="grid-bg pointer-events-none absolute inset-0" />
        <div className="container-x relative">
          <Reveal>
            <p className="eyebrow text-accent">Contact</p>
            <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">Talk to our sales team</h1>
            <p className="mt-4 max-w-2xl text-white/60">
              Quotations, availability, documentation — send your requirement and we'll respond promptly.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container-x grid gap-8 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-2">
            <Reveal>
              <div className="card p-6">
                <h2 className="font-bold">Direct lines</h2>
                <div className="mt-4 space-y-3">
                  {profile.phones?.map((p) => (
                    <a key={p} href={`tel:${p.replace(/[^+\d]/g, "")}`} className="flex items-center gap-3 rounded-xl bg-mist px-4 py-3 text-sm font-medium transition hover:bg-brand/5 hover:text-brand">
                      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-brand" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      {p}
                    </a>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-mist px-4 py-3 text-sm font-medium">
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-brand" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                    <path d="M22 6l-10 7L2 6" />
                  </svg>
                  <a href={`mailto:${contact.email ?? "info@oasisimpex.in"}`} className="hover:text-brand">
                    {contact.email ?? "info@oasisimpex.in"}
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="card p-6">
                <h2 className="font-bold">Head office</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink/65">{profile.offices?.[0]?.address}</p>
                <p className="mt-3 flex items-center gap-2 text-sm text-ink/65">
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-brand" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  {profile.hours}
                </p>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-3">
            <Reveal delay={0.1}>
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
