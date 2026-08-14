import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { AnimatedCursor } from "@/components/motion/AnimatedCursor";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { getCompanyProfile } from "@/lib/content";
import { getChatContent, getFooterContent } from "@/lib/site-content";
import { buildMetadata } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = buildMetadata({
  title: "Oasis Impex — Importer & Trader of PVC Resin & PET Raw Materials",
  description:
    "Oasis Impex is an established Ahmedabad-based importer and trader of PVC Resin, PVC Regrind, PET Resin and Calcium Carbonate — trusted by pipe, profile and fittings manufacturers across India.",
  path: "/",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a1628",
};

const GA_ID = process.env.GA_MEASUREMENT_ID ?? process.env.NEXT_PUBLIC_GA_ID ?? "";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [profile, footer, chat] = await Promise.all([getCompanyProfile(), getFooterContent(), getChatContent()]);

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
      <head>
        {GA_ID ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { send_page_view: true });`}
            </Script>
          </>
        ) : null}
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar profile={profile} />
        <SmoothScroll>
          <main>{children}</main>
        </SmoothScroll>
        <Footer profile={profile} footer={footer} />
        <ChatWidget chat={chat} />
        <AnimatedCursor />
        <div className="film-grain pointer-events-none fixed inset-0 z-[5]" aria-hidden />
      </body>
    </html>
  );
}
