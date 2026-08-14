import { desc, eq } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";

export const metadata = { title: "Our Vendors | Oasis Impex" };

export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  const vendors = await db()
    .select({ name: schema.vendors.name, company: schema.vendors.company, country: schema.vendors.country })
    .from(schema.vendors)
    .where(eq(schema.vendors.status, "ACTIVE"))
    .orderBy(desc(schema.vendors.createdAt));

  return (
    <>
      <section className="relative overflow-hidden bg-ink pt-32 pb-16 text-white">
        <div className="grid-bg pointer-events-none absolute inset-0" />
        <div className="container-x relative">
          <p className="eyebrow text-accent">Our Partners</p>
          <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">Trusted Vendors</h1>
          <p className="mt-4 max-w-2xl text-white/60">We work with leading manufacturers and suppliers across the globe to bring you consistent quality polymer raw materials.</p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-x">
          {vendors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
              <p className="font-bold text-ink">Vendor showcase coming soon</p>
              <p className="mt-2 text-sm text-ink/55">We are onboarding our global supplier network.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {vendors.map((v) => (
                <div key={v.name} className="rounded-2xl border border-line bg-white p-6 transition hover:shadow-lg">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand/10 text-xl font-bold text-brand">
                    {v.name.charAt(0)}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-ink">{v.name}</h3>
                  {v.company ? <p className="text-sm text-ink/60">{v.company}</p> : null}
                  {v.country ? <p className="mt-1 text-xs text-ink/45">{v.country}</p> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
