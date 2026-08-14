import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { AnimatedCursor } from "@/components/motion/AnimatedCursor";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { getCompanyProfile } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = buildMetadata({
  title: "Importer of Polymer Raw Materials",
  description:
    "Oasis Impex is an established Ahmedabad-based importer and supplier of PVC Resin, PVC Regrind, PET Resin and Calcium Carbonate — trusted by pipe, profile and fittings manufacturers across India.",
  path: "/",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a1628",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCompanyProfile();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: profile.name,
    legalName: profile.legalName,
    foundingDate: String(profile.established ?? 2010),
    description: profile.tagline,
    telephone: profile.phones?.[0],
    address: {
      "@type": "PostalAddress",
      streetAddress: profile.offices?.[0]?.address,
      addressLocality: "Ahmedabad",
      addressRegion: "Gujarat",
      addressCountry: "IN",
    },
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  };

  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar profile={profile} />
        <SmoothScroll>
          <main>{children}</main>
        </SmoothScroll>
        <Footer profile={profile} />
        <ChatWidget />
        <AnimatedCursor />
        <div className="film-grain pointer-events-none fixed inset-0 z-[5]" aria-hidden />
      </body>
    </html>
  );
}
