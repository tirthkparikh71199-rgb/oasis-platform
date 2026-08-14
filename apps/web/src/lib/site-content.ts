import { eq } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "./db";

export interface StatItem {
  value: string;
  suffix?: string;
  label: string;
}

export interface ProcessStep {
  step: string;
  title: string;
  text: string;
}

export interface HomeContent {
  hero: {
    eyebrow: string;
    headline1: string;
    headline2: string;
    subtext: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  stats: StatItem[];
  marquee: string[];
  productSection: { eyebrow: string; title: string; ctaLabel: string };
  supplyChain: { eyebrow: string; title: string; text: string };
  whySection: {
    eyebrow: string;
    title: string;
    text: string;
    stats: StatItem[];
    highlights: { title: string; text: string }[];
  };
  process: { eyebrow: string; title: string; steps: ProcessStep[] };
  cta: { title: string; text: string; buttonLabel: string; callLabel: string };
}

export interface AboutContent {
  hero: { eyebrow: string; title: string };
  whoWeAre: { title: string; paragraphs: string[] };
  stats: StatItem[];
  registrations: { eyebrow: string; title: string; cards: { label: string; value: string }[]; note: string };
  trade: { eyebrow: string; title: string; text: string; cards: { label: string; text: string }[] };
  locations: { title: string; headOfficeTitle: string; warehouseTitle: string; note: string };
  team: { eyebrow: string; title: string; members: { name: string; role: string; note: string }[]; footerNote: string };
  focus: { title: string; values: { title: string; text: string }[] };
  whoWeServe: { title: string; text: string; segments: { title: string; text: string }[] };
}

export interface ContactPageContent {
  hero: { eyebrow: string; title: string; subtext: string };
  directLinesTitle: string;
  emailTitle: string;
  headOfficeTitle: string;
  formIntro: string;
}

export interface FooterContent {
  tagline: string;
  description: string;
  productsTitle: string;
  companyTitle: string;
  bottomTagline: string;
}

export interface ProductsPageContent {
  eyebrow: string;
  title: string;
  subtext: string;
}

export interface ChatContent {
  assistantName: string;
  welcome: string;
  quickPrompts: string[];
}

export interface MediaContent {
  heroImage?: string;
  aboutImage?: string;
  ogImage?: string;
  logo?: string;
}

export interface SiteContent {
  home: HomeContent;
  about: AboutContent;
  contactPage: ContactPageContent;
  productsPage: ProductsPageContent;
  footer: FooterContent;
  chat: ChatContent;
  media: MediaContent;
}

const DEFAULT_STATS: StatItem[] = [
  { value: "2010", label: "Established" },
  { value: "15", suffix: "+", label: "Years in PVC trade" },
  { value: "4", label: "Product lines" },
  { value: "All", label: "India supply" },
];

export const DEFAULT_SITE_CONTENT: SiteContent = {
  home: {
    hero: {
      eyebrow: "Import · Supply · Trust",
      headline1: "PVC raw materials,",
      headline2: "delivered with certainty.",
      subtext:
        "Oasis Impex sources and supplies PVC Resin, PVC Regrind, PET Resin and Calcium Carbonate to pipe, profile and fittings manufacturers across India — consistent grades, dependable supply, and a team that answers the phone.",
      ctaPrimary: "Explore products",
      ctaSecondary: "Request a quotation",
    },
    stats: DEFAULT_STATS,
    marquee: ["PVC RESIN", "PET RESIN", "PVC REGRIND", "CALCIUM CARBONATE", "IMPORT · SUPPLY · TRUST", "K-67 · K-57", "IV 0.80 BOTTLE GRADE", "PAN-INDIA DISPATCH"],
    productSection: { eyebrow: "Product range", title: "What we supply", ctaLabel: "View full catalogue" },
    supplyChain: {
      eyebrow: "How we operate",
      title: "From global sources to your production line",
      text: "Drag the nodes — this is a live view of our sourcing and supply model. We import from established producers and supply manufacturers across India.",
    },
    whySection: {
      eyebrow: "Why Oasis Impex",
      title: "A supplier your production can rely on",
      text: "Since 2010, we've built our business on one idea — dependable raw material supply. We don't chase volume; we build relationships with manufacturers who need consistency.",
      stats: [
        { value: "2010", label: "Established and continuously operating" },
        { value: "4", suffix: "+", label: "Core product lines, multiple grades" },
        { value: "Pan-India", label: "Dispatch coverage across the country" },
        { value: "2", label: "Core industries served" },
      ],
      highlights: [
        { title: "Registered & verifiable", text: "GSTIN and LEI available on public record." },
        { title: "International sourcing", text: "Established producer relationships across Asia, the Middle East and Europe." },
        { title: "Quality you can verify", text: "Product documentation and certificates shared transparently before supply." },
      ],
    },
    process: {
      eyebrow: "How it works",
      title: "From inquiry to dispatch",
      steps: [
        { step: "01", title: "Enquire", text: "Tell us your grade, quantity and destination — by phone, WhatsApp, email or the chat assistant." },
        { step: "02", title: "Get a quote", text: "Our sales team responds with a firm price and availability, usually the same working day." },
        { step: "03", title: "Supply", text: "We coordinate quality, packaging and pan-India dispatch from our Ahmedabad operations." },
        { step: "04", title: "Support", text: "Consistent follow-ups, documentation and a team that stays with you order after order." },
      ],
    },
    cta: {
      title: "Ready to secure your raw material supply?",
      text: "Share your requirement and get a firm quotation from our sales team — usually the same working day.",
      buttonLabel: "Request a quotation",
      callLabel: "Call {phone}",
    },
  },
  about: {
    hero: { eyebrow: "About us", title: "Built on supply you can build on" },
    whoWeAre: {
      title: "Who we are",
      paragraphs: [
        "Oasis Impex is a partnership firm based in Ahmedabad, Gujarat, importing and supplying PVC raw materials since 2010. We focus on a few things and do them consistently well — PVC Resin, PVC Regrind, PET Resin and Calcium Carbonate.",
        "We are traders, not manufacturers — we don't run production lines. Our strength is trusted sourcing, logistics and long-standing relationships with established producers abroad, delivering to manufacturers across India.",
        "We operate with transparency: verifiable registrations, clear documentation, and a team that answers the phone.",
      ],
    },
    stats: [
      { value: "2010", label: "Founded" },
      { value: "~10", label: "People" },
      { value: "4", label: "Product lines" },
      { value: "2", label: "Core industries" },
    ],
    registrations: {
      eyebrow: "Registrations",
      title: "Verifiable, public record",
      cards: [
        { label: "GSTIN", value: "24AADFO1073E1ZQ" },
        { label: "Legal Entity Identifier", value: "3358006ILHHB8Z3KNT12" },
        { label: "AEO Certified", value: "INAADFO1073E1F221" },
        { label: "Entity type", value: "Partnership firm" },
        { label: "Business type", value: "Trading company — Importer/Exporter" },
        { label: "Lead time", value: "~15 days" },
      ],
      note: "",
    },
    trade: {
      eyebrow: "Sourcing & logistics",
      title: "How we trade",
      text: "We source polymer raw materials from established producers across Southeast Asia, import through Mundra port, and supply manufacturers throughout India. As a trading house, our job is dependable sourcing, documentation and delivery — not production.",
      cards: [
        { label: "Sourcing", text: "Southeast Asia & global producers" },
        { label: "Entry port", text: "Mundra, Gujarat — ICD Nava Sheva" },
        { label: "Dispatch", text: "Trucks & containers, all-India" },
      ],
    },
    locations: {
      title: "Where we operate",
      headOfficeTitle: "Head office",
      warehouseTitle: "Warehouse",
      note: "Registered under the LEI system (active), GST-registered in Gujarat, and authorized as an AEO (Authorized Economic Operator) — Importer/Exporter.",
    },
    team: {
      eyebrow: "The partnership",
      title: "The people behind the supply",
      members: [
        { name: "Keyur M. Parikh", role: "Co-promoter", note: "B.Sc (Chemistry); leads sourcing & trading." },
        { name: "Jinesh Patel", role: "Co-promoter · Sales", note: "Customer relationships & order management." },
        { name: "Kalpesh J. Patel", role: "Partner", note: "Operations & supplier relations." },
      ],
      footerNote: "",
    },
    focus: {
      title: "Our focus",
      values: [
        { title: "Consistency", text: "Grades and quality you can rely on batch after batch." },
        { title: "Responsiveness", text: "Same-working-day quotes and a team that picks up the phone." },
        { title: "Transparency", text: "Open documentation, verifiable registrations, clear terms." },
        { title: "Relationships", text: "We grow with manufacturers, not just transactions." },
      ],
    },
    whoWeServe: {
      title: "Who we serve",
      text: "Our supply supports the industries where material consistency directly affects finished product quality:",
      segments: [
        { title: "Pipe, profile & fittings manufacturers", text: "Rigid and drainage PVC pipes, profiles and fittings — where dependable PVC Resin supply keeps production lines moving." },
        { title: "PVC compounders & recyclers", text: "Flexible compounds, masterbatch and recycled-content lines — served with PVC Regrind and Calcium Carbonate grades." },
        { title: "Water bottling & beverage plants", text: "Bottle-grade PET Resin (IV 0.80) for drinking-water and beverage bottles and preforms, backed by food-contact certifications." },
      ],
    },
  },
  contactPage: {
    hero: {
      eyebrow: "Contact",
      title: "Talk to our sales team",
      subtext: "Quotations, availability, documentation — send your requirement and we'll respond promptly.",
    },
    directLinesTitle: "Direct lines",
    emailTitle: "Email",
    headOfficeTitle: "Head office",
    formIntro: "",
  },
  footer: {
    tagline: "Importer & trader of PVC raw materials",
    description: "Serving pipe, profile and fittings manufacturers across India.",
    productsTitle: "Products",
    companyTitle: "Company",
    bottomTagline: "Importer of polymer raw materials · Ahmedabad, India",
  },
  productsPage: {
    eyebrow: "Catalogue",
    title: "Our products",
    subtext: "Grades, documentation and availability shared transparently. Not sure what you need? Ask the assistant or talk to our sales team.",
  },
  chat: {
    assistantName: "Oasis Impex assistant",
    welcome:
      "Namaste! I'm the Oasis Impex assistant. Ask me about PVC Resin, PVC Regrind, PET Resin and Calcium Carbonate — or connect with our sales team.",
    quickPrompts: ["What products do you supply?", "Do you have PVC Resin K67?", "Get a quotation", "Talk to a sales agent"],
  },
  media: {},
};

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const rows = await db()
      .select({ value: schema.settings.value })
      .from(schema.settings)
      .where(eq(schema.settings.key, "site.content"))
      .limit(1);
    if (rows.length === 0) return DEFAULT_SITE_CONTENT;
    return deepMerge(DEFAULT_SITE_CONTENT, rows[0].value as Partial<SiteContent>);
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

export async function getHomeContent() {
  return (await getSiteContent()).home;
}

export async function getAboutContent() {
  return (await getSiteContent()).about;
}

export async function getContactPageContent() {
  return (await getSiteContent()).contactPage;
}

export async function getFooterContent() {
  return (await getSiteContent()).footer;
}

export async function getProductsPageContent() {
  return (await getSiteContent()).productsPage;
}

export async function getChatContent() {
  return (await getSiteContent()).chat;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function deepMerge<T>(base: T, override: unknown): T {
  if (!isObject(override)) return base;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(base as Record<string, unknown>)) {
    const b = (base as Record<string, unknown>)[key];
    const o = override[key];
    if (Array.isArray(b)) {
      out[key] = Array.isArray(o) && o.length > 0 ? o : b;
    } else if (isObject(b)) {
      out[key] = isObject(o) ? deepMerge(b, o) : b;
    } else {
      out[key] = o === undefined || o === null || o === "" ? b : o;
    }
  }
  return out as T;
}

export async function upsertSiteContent(value: SiteContent): Promise<void> {
  await db()
    .insert(schema.settings)
    .values({ key: "site.content", value })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value, updatedAt: new Date() } });
}

export async function getCompanyProfileSettings() {
  try {
    const rows = await db()
      .select({ value: schema.settings.value })
      .from(schema.settings)
      .where(eq(schema.settings.key, "company.profile"))
      .limit(1);
    return rows[0]?.value as Record<string, unknown> | undefined;
  } catch {
    return undefined;
  }
}

export async function getContactSettingsRaw() {
  try {
    const rows = await db()
      .select({ value: schema.settings.value })
      .from(schema.settings)
      .where(eq(schema.settings.key, "contact.sales"))
      .limit(1);
    return rows[0]?.value as Record<string, unknown> | undefined;
  } catch {
    return undefined;
  }
}
