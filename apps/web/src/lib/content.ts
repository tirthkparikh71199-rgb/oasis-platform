import { and, desc, eq, sql } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "./db";

export interface CompanyProfile {
  name: string;
  legalName?: string;
  established?: number;
  employees?: string;
  tagline?: string;
  businessType?: string;
  offices?: { label: string; address: string }[];
  warehouse?: string;
  phones?: string[];
  hours?: string;
  leadTime?: string;
  markets?: string[];
  aeo?: string;
  gstin?: string;
  lei?: string;
}

export interface ContactSettings {
  email?: string;
  phone?: string;
}

const DEFAULT_PROFILE: CompanyProfile = {
  name: "Oasis Impex",
  legalName: "Oasis Impex",
  established: 2010,
  employees: "~10",
  tagline: "Importer & trader of PVC raw materials",
  businessType: "Trading company",
  offices: [{ label: "Head Office", address: "510, City Center, Opp. Shukan Mall, Science City Road, Ahmedabad, Gujarat 380060, India" }],
  warehouse: "Shed 10 & 11, Mahalaxmi Industrial Compound, 806/P Kothari Industrial Estate, Santej, Kalol, Gandhinagar 382721",
  phones: ["+91 98251 41637", "+91 98250 59778", "+91 98250 35026"],
  hours: "Mon–Sat, 10:30 – 18:00 IST",
  leadTime: "15 days",
  markets: ["Southeast Asia", "North America"],
  aeo: "INAADFO1073E1F221",
  gstin: "24AADFO1073E1ZQ",
  lei: "3358006ILHHB8Z3KNT12",
};

export async function getCompanyProfile(): Promise<CompanyProfile> {
  try {
    const rows = await db()
      .select({ value: schema.settings.value })
      .from(schema.settings)
      .where(eq(schema.settings.key, "company.profile"))
      .limit(1);
    if (rows.length === 0) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...(rows[0].value as Partial<CompanyProfile>) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export async function getContactSettings(): Promise<ContactSettings> {
  try {
    const rows = await db()
      .select({ value: schema.settings.value })
      .from(schema.settings)
      .where(eq(schema.settings.key, "contact.sales"))
      .limit(1);
    if (rows.length === 0) return {};
    return rows[0].value as ContactSettings;
  } catch {
    return {};
  }
}

export async function getProducts(opts: { publicOnly?: boolean } = {}) {
  try {
    const q = db().select().from(schema.products);
    if (opts.publicOnly) {
      return await q.where(and(eq(schema.products.isActive, true), eq(schema.products.isPublic, true))).orderBy(desc(schema.products.updatedAt));
    }
    return await q.orderBy(desc(schema.products.updatedAt));
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string, publicOnly = true) {
  try {
    const rows = await db()
      .select()
      .from(schema.products)
      .where(and(eq(schema.products.slug, slug), eq(schema.products.isActive, true), publicOnly ? eq(schema.products.isPublic, true) : sql`TRUE`))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function getCategories() {
  try {
    return await db().select().from(schema.productCategories).orderBy(schema.productCategories.sortOrder);
  } catch {
    return [];
  }
}

export async function getSeo(route: string) {
  try {
    const rows = await db().select().from(schema.seoPages).where(eq(schema.seoPages.route, route)).limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}
