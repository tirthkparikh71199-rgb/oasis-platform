import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/content";
import { buildMetadata, buildProductSchema } from "@/lib/seo";
import { ProductViewTracker } from "./product-view-tracker";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return buildMetadata({
    title: product.name,
    description: product.shortDescription ?? product.seoDescription ?? `Supplied by Oasis Impex — importer of polymer raw materials.`,
    path: `/products/${product.slug}`,
    ogImage: product.ogImage ?? undefined,
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, all] = await Promise.all([getProductBySlug(slug), getProducts({ publicOnly: true })]);
  if (!product) notFound();

  const specEntries = Object.entries(product.specifications ?? {});
  const others = all.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildProductSchema({ name: product.name, description: product.shortDescription, slug: product.slug, category: product.categoryId })) }} />
      <ProductViewTracker product={{ id: product.id, name: product.name, slug: product.slug, category: product.categoryId }} />
      <section className="relative overflow-hidden bg-ink pt-32 pb-16 text-white">
        <div className="grid-bg pointer-events-none absolute inset-0" />
        <div className="container-x relative">
          <p className="eyebrow text-accent">Product detail</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">{product.name}</h1>
          {product.shortDescription && <p className="mt-4 max-w-2xl text-white/65">{product.shortDescription}</p>}
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="container-x grid gap-10 lg:grid-cols-5 lg:gap-14">
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold">Overview</h2>
            <p className="mt-4 leading-relaxed text-ink/70">{product.description}</p>

            {product.applications && product.applications.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold">Applications</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.applications.map((a) => (
                    <span key={a} className="rounded-full border border-brand/20 bg-brand/5 px-3 py-1.5 text-sm font-medium text-brand">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.industries && product.industries.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold">Industries served</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.industries.map((i) => (
                    <span key={i} className="rounded-full bg-mist px-3 py-1.5 text-sm font-medium text-ink/70">
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="card p-6">
              <h3 className="font-bold">Specifications</h3>
              {specEntries.length > 0 ? (
                <dl className="mt-4 space-y-3 text-sm">
                  {specEntries.map(([k, v]) => (
                    <div key={k} className="flex items-start justify-between gap-3 border-b border-line pb-3 last:border-0">
                      <dt className="text-ink/55">{k}</dt>
                      <dd className="text-right font-medium text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-4 text-sm text-ink/50">Detailed specifications shared on request.</p>
              )}

              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                {product.origin && (
                  <div className="rounded-xl bg-mist p-3">
                    <div className="text-xs text-ink/50">Origin</div>
                    <div className="font-medium">{product.origin}</div>
                  </div>
                )}
                {product.packaging && (
                  <div className="rounded-xl bg-mist p-3">
                    <div className="text-xs text-ink/50">Packaging</div>
                    <div className="font-medium">{product.packaging}</div>
                  </div>
                )}
                {product.unit && (
                  <div className="rounded-xl bg-mist p-3">
                    <div className="text-xs text-ink/50">Unit</div>
                    <div className="font-medium">{product.unit}</div>
                  </div>
                )}
                {product.moq && (
                  <div className="rounded-xl bg-mist p-3">
                    <div className="text-xs text-ink/50">Minimum order</div>
                    <div className="font-medium">{product.moq}</div>
                  </div>
                )}
              </div>

              <a href={`/contact?product=${product.slug}`} className="btn-primary mt-6 w-full px-5 py-3 text-sm">
                Request a quote for this product
              </a>
            </div>
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="border-t border-line bg-white py-14">
          <div className="container-x">
            <h2 className="text-xl font-bold">Related products</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {others.map((p) => (
                <a key={p.id} href={`/products/${p.slug}`} className="card card-hover p-5">
                  <h3 className="font-bold">{p.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-ink/55">{p.shortDescription}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
