import type { Metadata } from "next";
import { env } from "@oasis/config";

interface SeoInput {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  keywords?: string[];
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}

const SITE = {
  name: "Oasis Impex",
  legalName: "Oasis Impex (Partnership)",
  domain: () => env().APP_URL,
  twitter: "@oasisimpex",
  established: "2010",
  logo: () => `${env().APP_URL}/logo.png`,
  ogDefault: () => `${env().APP_URL}/og-default.png`,
};

const DEFAULT_KEYWORDS = [
  "PVC Resin",
  "PVC Resin K67",
  "PVC Resin K57",
  "PVC Resin Importer India",
  "PVC Resin Supplier Ahmedabad",
  "PVC Regrind",
  "PET Resin",
  "PET Resin Bottle Grade",
  "Calcium Carbonate",
  "Polymer Raw Material Importer",
  "Polymer Trading India",
  "PVC Resin K67 Price",
  "PVC Suspension Grade",
  "Oasis Impex",
  "Ahmedabad Polymer Importer",
  "Gujarat PVC Supplier",
  "Pipe grade PVC",
  "Fittings grade PVC",
];

export function buildMetadata({ title, description, path = "/", ogImage, keywords, type = "website", publishedTime, modifiedTime }: SeoInput): Metadata {
  const url = `${SITE.domain()}${path}`;
  const image = ogImage ?? SITE.ogDefault();
  return {
    metadataBase: new URL(SITE.domain()),
    title: {
      default: `${title} | ${SITE.name}`,
      template: `%s | ${SITE.name}`,
    },
    description: description.slice(0, 160),
    keywords: [...(keywords ?? []), ...DEFAULT_KEYWORDS].join(", "),
    authors: [{ name: SITE.name, url: SITE.domain() }],
    creator: SITE.name,
    publisher: SITE.legalName,
    applicationName: SITE.name,
    referrer: "origin-when-cross-origin",
    formatDetection: { email: false, telephone: false, address: false },
    alternates: {
      canonical: url,
      languages: {
        "en-IN": url,
        "x-default": url,
      },
    },
    openGraph: {
      title,
      description: description.slice(0, 200),
      url,
      siteName: SITE.name,
      images: [
        { url: image, width: 1200, height: 630, alt: `${title} — ${SITE.name}` },
      ],
      locale: "en_IN",
      type,
      ...(publishedTime && type === "article" ? { publishedTime, modifiedTime: modifiedTime ?? publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      site: SITE.twitter,
      creator: SITE.twitter,
      title,
      description: description.slice(0, 200),
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
    other: {
      "google-site-verification": process.env.GOOGLE_SITE_VERIFICATION ?? "",
    },
  };
}

// ---------------------------------------------------------------
// JSON-LD Structured Data (Google rich results)
// ---------------------------------------------------------------

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.domain()}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.domain(),
    logo: {
      "@type": "ImageObject",
      url: SITE.logo(),
      width: 512,
      height: 512,
    },
    image: SITE.logo(),
    description: "Established importer and supplier of polymer raw materials — PVC Resin, PVC Regrind, PET Resin and Calcium Carbonate — in Ahmedabad, India since 2010.",
    foundingDate: SITE.established,
    slogan: "Importer & Trader of PVC Resin & PET Raw Materials",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1112, Fortune Business Hub, Science City Road",
      addressLocality: "Ahmedabad",
      addressRegion: "Gujarat",
      postalCode: "380060",
      addressCountry: "IN",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+91-98251-41637",
        contactType: "sales",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi", "Gujarati"],
      },
      {
        "@type": "ContactPoint",
        telephone: "+91-98250-59778",
        contactType: "customer service",
        areaServed: "IN",
      },
    ],
    sameAs: [],
  };
}

export function buildLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Store"],
    "@id": `${SITE.domain()}/#localbusiness`,
    name: SITE.name,
    image: SITE.logo(),
    url: SITE.domain(),
    telephone: "+91-98251-41637",
    priceRange: "$$",
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
      latitude: 23.0752,
      longitude: 72.5109,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "10:30",
      closes: "18:00",
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    knowsAbout: ["PVC Resin", "PET Resin", "PVC Regrind", "Calcium Carbonate", "Polymer Trading", "Raw Material Import"],
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.domain()}/#website`,
    url: SITE.domain(),
    name: SITE.name,
    description: "Importer & Trader of PVC Resin & PET Raw Materials",
    publisher: { "@id": `${SITE.domain()}/#organization` },
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.domain()}/products?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildProductSchema(product: {
  name: string;
  description?: string | null;
  slug: string;
  category?: string | null;
  image?: string | null;
  sku?: string | null;
  moq?: string | null;
  packaging?: string | null;
  origin?: string | null;
}) {
  const url = `${SITE.domain()}/products/${product.slug}`;
  const image = product.image ?? SITE.ogDefault();
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: product.description ?? `${product.name} — imported and supplied by Oasis Impex, established polymer raw materials trader in Ahmedabad, India.`,
    url,
    image,
    sku: product.sku ?? `OASIS-${product.slug.toUpperCase()}`,
    brand: {
      "@type": "Brand",
      name: SITE.name,
    },
    manufacturer: { "@id": `${SITE.domain()}/#organization` },
    category: product.category ?? "Polymer Raw Materials",
    offers: {
      "@type": "Offer",
      url,
      availability: "https://schema.org/InStock",
      priceCurrency: "INR",
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "INR",
        valueAddedTaxIncluded: false,
      },
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${SITE.domain()}/#organization` },
      areaServed: { "@type": "Country", name: "India" },
    },
    ...(product.moq ? { additionalProperty: [{ "@type": "PropertyValue", name: "Minimum Order Quantity", value: product.moq }] } : {}),
  };
}

export function buildBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE.domain()}${item.url}`,
    })),
  };
}

export function buildFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildReviewSchema(reviews: Array<{ author: string; rating: number; text: string; date?: string }>) {
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = reviews.length > 0 ? totalRating / reviews.length : 5;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.domain()}/#organization`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avgRating.toFixed(1),
      bestRating: 5,
      worstRating: 1,
      ratingCount: reviews.length,
    },
    review: reviews.map((r) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
      author: { "@type": "Person", name: r.author },
      reviewBody: r.text,
      ...(r.date ? { datePublished: r.date } : {}),
    })),
  };
}

export function buildServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE.domain()}/#service`,
    name: "Polymer Raw Material Import & Supply",
    provider: { "@id": `${SITE.domain()}/#organization` },
    areaServed: { "@type": "Country", name: "India" },
    description: "Importing and supplying PVC Resin, PVC Regrind, PET Resin and Calcium Carbonate to pipe, profile and fittings manufacturers across India.",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Polymer Raw Materials",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "PVC Resin K67" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "PVC Resin K57" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "PET Resin (Bottle Grade)" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "PVC Regrind" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Calcium Carbonate" } },
      ],
    },
  };
}
