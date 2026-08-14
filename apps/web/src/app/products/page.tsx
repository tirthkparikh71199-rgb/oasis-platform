import type { Metadata } from "next";
import { ProductCard } from "@/components/home/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { getProducts, getCategories } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Explore our range: PVC Resin (K67, K57), PET Resin, PVC Regrind and Calcium Carbonate — consistent quality, reliable supply across India.",
};

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getProducts({ publicOnly: true }), getCategories()]);
  const catBySlug = new Map(categories.map((c) => [c.id, c.slug]));

  return (
    <>
      <section className="relative overflow-hidden bg-ink pt-32 pb-16 text-white">
        <div className="grid-bg pointer-events-none absolute inset-0" />
        <div className="container-x relative">
          <Reveal>
            <p className="eyebrow text-accent">Catalogue</p>
            <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">Our products</h1>            <p className="mt-4 max-w-2xl text-white/60">
              Grades, documentation and availability shared transparently. Not sure what you need? Ask the assistant or talk to our sales team.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-x">
          {products.length === 0 ? (
            <Reveal>
              <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
                <p className="font-bold">Product catalogue coming soon</p>
                <p className="mt-2 text-sm text-ink/55">Please contact us directly for current availability.</p>
              </div>
            </Reveal>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} categorySlug={catBySlug.get(p.categoryId ?? "")} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
