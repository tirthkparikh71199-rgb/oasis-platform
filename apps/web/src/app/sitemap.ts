import type { MetadataRoute } from "next";
import { getProducts, getSeo } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://oasisimpex.in";
  const products = await getProducts({ publicOnly: true });

  const staticRoutes = ["", "/products", "/about", "/contact", "/privacy", "/terms"].map((r) => ({
    url: `${base}${r}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: r === "" ? 1 : 0.8,
  }));

  const productRoutes = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: p.updatedAt ?? new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const seoPages = await Promise.all(
    ["/", "/products", "/about", "/contact", "/privacy", "/terms"].map(async (route) => {
      const seo = await getSeo(route);
      return seo ? { url: `${base}${route}`, lastModified: seo.updatedAt ?? new Date() } : null;
    }),
  );
  const extra = seoPages.filter(Boolean) as MetadataRoute.Sitemap;

  return [...staticRoutes, ...productRoutes, ...extra];
}
