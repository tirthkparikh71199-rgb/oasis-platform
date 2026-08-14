import type { Metadata } from "next";
import { env } from "@oasis/config";

interface SeoInput {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  keywords?: string[];
  type?: "website" | "article";
}

const SITE = {
  name: "Oasis Impex",
  domain: () => env().APP_URL,
  twitter: "@oasisimpex",
};

export function buildMetadata({ title, description, path = "/", ogImage, keywords, type = "website" }: SeoInput): Metadata {
  const url = `${SITE.domain()}${path}`;
  return {
    metadataBase: new URL(SITE.domain()),
    title: {
      default: `${SITE.name} — Importer & Trader of PVC Resin & PET Raw Materials`,
      template: `%s | ${SITE.name}`,
    },
    description,
    keywords: keywords?.join(", ") ?? "PVC Resin, PVC Resin Importer, PVC Resin Supplier, PVC Regrind, PET Resin, PET Resin Supplier, Calcium Carbonate, polymer raw material importer, Oasis Impex, Ahmedabad, Gujarat, India",
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      images: [{ url: ogImage ?? `${SITE.domain()}/og-default.png`, width: 1200, height: 630 }],
      locale: "en_IN",
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage ?? `${SITE.domain()}/og-default.png`],
    },
    robots: { index: true, follow: true },
  };
}

export function buildProductSchema(product: {
  name: string;
  description?: string | null;
  slug: string;
  category?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? `${product.name} supplied by Oasis Impex`,
    url: `${env().APP_URL}/products/${product.slug}`,
    brand: { "@type": "Brand", name: "Oasis Impex" },
    manufacturer: {
      "@type": "Organization",
      name: "Oasis Impex",
      url: env().APP_URL,
    },
    category: product.category ?? "Polymer Raw Materials",
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "INR",
      seller: { "@type": "Organization", name: "Oasis Impex" },
    },
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Oasis Impex",
    url: env().APP_URL,
    logo: `${env().APP_URL}/logo.png`,
    description: "Established importer and supplier of polymer raw materials in Ahmedabad, India",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1112, Fortune Business Hub, Science City Road",
      addressLocality: "Ahmedabad",
      addressRegion: "Gujarat",
      postalCode: "380060",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-98251-41637",
      contactType: "sales",
      areaServed: "IN",
    },
    sameAs: [],
  };
}

export function buildLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Oasis Impex",
    image: `${env().APP_URL}/logo.png`,
    url: env().APP_URL,
    telephone: "+91-98251-41637",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1112, Fortune Business Hub, Science City Road",
      addressLocality: "Ahmedabad",
      addressRegion: "Gujarat",
      postalCode: "380060",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 23.0225,
      longitude: 72.5714,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "10:30",
      closes: "18:00",
    },
  };
}
