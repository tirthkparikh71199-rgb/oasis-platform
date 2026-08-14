import type { Metadata } from "next";
import { env } from "@oasis/config";

interface SeoInput {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  keywords?: string[];
}

const SITE = {
  name: "Oasis Impex",
  domain: () => env().APP_URL,
};

export function buildMetadata({ title, description, path = "/", ogImage, keywords }: SeoInput): Metadata {
  const url = `${SITE.domain()}${path}`;
  return {
    metadataBase: new URL(SITE.domain()),
    title: {
      default: `${SITE.name} — Importer of Polymer Raw Materials`,
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
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export const structuredData = (data: Record<string, unknown>) => JSON.stringify(data);
