import { createDb } from "./index";
import { schema } from "./index";
import { env } from "@oasis/config";
import { hash } from "argon2";

const PERMISSION_SEEDS = [
  ["users.read", "View users"],
  ["users.write", "Create or edit users"],
  ["users.deactivate", "Deactivate users"],
  ["roles.manage", "Manage roles and permissions"],
  ["catalog.read", "View product catalogue"],
  ["catalog.write", "Create or edit products"],
  ["catalog.publish", "Toggle product public visibility"],
  ["inventory.read", "View inventory"],
  ["inventory.write", "Record inventory movements"],
  ["inventory.manage", "Manage warehouses and batches"],
  ["partners.read", "View customers and vendors"],
  ["partners.write", "Create or edit customers and vendors"],
  ["leads.read", "View inquiries and leads"],
  ["leads.write", "Update inquiry status and assignment"],
  ["leads.export", "Export leads"],
  ["chat.read", "View conversations and messages"],
  ["chat.reply", "Reply to conversations as agent"],
  ["handoffs.manage", "Manage handoffs and assignment"],
  ["knowledge.read", "View knowledge base"],
  ["knowledge.write", "Upload or edit documents"],
  ["knowledge.publish", "Change document visibility"],
  ["reports.read", "View reports"],
  ["settings.read", "View settings"],
  ["settings.write", "Edit settings"],
  ["seo.read", "View SEO pages"],
  ["seo.write", "Edit SEO pages"],
  ["audit.read", "View audit logs"],
  ["system.monitor", "View system health and jobs"],
  ["integrations.manage", "Configure integrations"],
] as const;

const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: PERMISSION_SEEDS.map(([code]) => code),
  ADMIN: PERMISSION_SEEDS.filter(([code]) => !["roles.manage", "users.deactivate", "integrations.manage"].includes(code)).map(([code]) => code),
  SALES: ["catalog.read", "partners.read", "partners.write", "leads.read", "leads.write", "leads.export", "chat.read", "chat.reply", "handoffs.manage", "knowledge.read", "reports.read"],
  INVENTORY_MANAGER: ["catalog.read", "catalog.write", "inventory.read", "inventory.write", "inventory.manage", "partners.read", "knowledge.read"],
  KNOWLEDGE_MANAGER: ["catalog.read", "knowledge.read", "knowledge.write", "knowledge.publish", "seo.read", "seo.write"],
  AGENT: ["catalog.read", "leads.read", "chat.read", "chat.reply", "handoffs.manage", "knowledge.read"],
  VIEWER: ["catalog.read", "inventory.read", "partners.read", "leads.read", "chat.read", "knowledge.read", "reports.read"],
};

type ProductSeed = {
  name: string;
  slug: string;
  sku: string;
  category: string;
  shortDescription: string;
  description: string;
  specifications: Record<string, string>;
  applications: string[];
  industries: string[];
  origin: string;
  packaging: string;
  unit: string;
  moq: string;
};

const PRODUCT_SEEDS: ProductSeed[] = [
  {
    name: "PVC Resin K67",
    slug: "pvc-resin-k67",
    sku: "PVC-K67",
    category: "PVC RESIN",
    shortDescription: "Suspension PVC resin, general purpose K67 grade for rigid pipes and profiles.",
    description: "Premium suspension grade PVC resin (K-value 67) imported from established producers in Thailand, China and beyond. Consistent quality, excellent thermal stability and processing characteristics for pipes, profiles and fittings.",
    specifications: { "K-Value": "66–68", "Particle Size (D50)": "80–150 µm", "Bulk Density": "0.50–0.60 g/cm³", "Viscosity Number": "82–90" },
    applications: ["Rigid pipes", "Profiles", "Fittings", "Electrical conduits"],
    industries: ["Pipe manufacturing", "Profile extrusion"],
    origin: "Thailand / China / global import",
    packaging: "25 kg bags",
    unit: "MT",
    moq: "As negotiated",
  },
  {
    name: "PVC Resin K57",
    slug: "pvc-resin-k57",
    sku: "PVC-K57",
    category: "PVC RESIN",
    shortDescription: "Suspension PVC resin K57 for flexible and semi-rigid applications.",
    description: "Low-K suspension PVC resin with excellent plasticiser absorption, ideal for flexible compounds, flooring and hoses.",
    specifications: { "K-Value": "56–58", "Bulk Density": "0.50–0.58 g/cm³", "Viscosity Number": "63–71" },
    applications: ["Flexible compounds", "Flooring", "Hoses", "Cable insulation"],
    industries: ["PVC compounding", "Cables"],
    origin: "Thailand / China / global import",
    packaging: "25 kg bags",
    unit: "MT",
    moq: "As negotiated",
  },
  {
    name: "PET Resin (Bottle Grade)",
    slug: "pet-resin-bottle-grade",
    sku: "PET-BG",
    category: "PET RESIN",
    shortDescription: "Intrinsic viscosity 0.80 bottle-grade PET resin for drinking-water and beverage bottles.",
    description: "Bottle-grade PET resin with IV 0.80 for drinking-water and beverage bottles and preforms, supported by full food-contact certifications for packaging use.",
    specifications: { "Intrinsic Viscosity": "0.80 ± 0.02", "Acetaldehyde": "< 1.0 ppm", "Moisture": "< 0.30 %" },
    applications: ["Water bottles", "CSD bottles", "Preforms"],
    industries: ["Water bottling", "Beverages"],
    origin: "Global import",
    packaging: "1 MT bags / jumbo",
    unit: "MT",
    moq: "As negotiated",
  },
  {
    name: "PVC Regrind (Rigid)",
    slug: "pvc-regrind-rigid",
    sku: "PVC-RG-R",
    category: "PVC REGRIND",
    shortDescription: "Washed and milled rigid PVC regrind, graded and consistent.",
    description: "Graded rigid PVC regrind with consistent colour and melt behaviour. Quality-checked for uniform particle size for reuse in pipe and profile manufacturing.",
    specifications: { "Mesh": "5–8 mm", "Purity": "≥ 98 %", "Moisture": "< 0.5 %" },
    applications: ["Inner pipe layers", "Drainage pipes", "Profiles"],
    industries: ["PVC recycling"],
    origin: "India / import",
    packaging: "Jumbo bags",
    unit: "MT",
    moq: "As negotiated",
  },
  {
    name: "Calcium Carbonate Powder",
    slug: "calcium-carbonate-powder",
    sku: "CACO3",
    category: "CALCIUM CARBONATE",
    shortDescription: "Surface-treated calcium carbonate filler for PVC compounding and masterbatch.",
    description: "Precipitated and ground calcium carbonate grades for PVC compounding, masterbatch and paint. Available in multiple mesh sizes with surface treatment on request.",
    specifications: { "Mesh": "300–1200", "Whiteness": "≥ 92 %", "Moisture": "< 0.2 %" },
    applications: ["PVC compounds", "Masterbatch", "Paints", "Adhesives"],
    industries: ["PVC compounding", "Coatings"],
    origin: "India",
    packaging: "25 / 50 kg bags",
    unit: "MT",
    moq: "As negotiated",
  },
];

const DEFAULT_SETTINGS = [
  {
    key: "company.profile",
    value: {
      name: "Oasis Impex",
      legalName: "Oasis Impex (Partnership)",
      established: 2010,
      employees: "~10",
      registration: {
        gstin: "24AADFO1073E1ZQ",
        lei: "3358006ILHHB8Z3KNT12",
        aeo: "INAADFO1073E1F221",
        partnershipFirm: true,
      },
      offices: [
        { label: "Head Office", address: "510, City Center, Opp. Shukan Mall, Science City Road, Ahmedabad, Gujarat 380060, India" },
      ],
      warehouse: "Shed 10 & 11, Mahalaxmi Industrial Compound, 806/P Kothari Industrial Estate, Santej, Kalol, Gandhinagar 382721",
      phones: ["+91 98251 41637", "+91 98250 59778", "+91 98250 35026"],
      hours: "Mon–Sat, 10:30 – 18:00 IST",
      leadTime: "15 days",
      markets: ["Southeast Asia", "North America"],
      tagline: "Importer & trader of PVC raw materials",
      businessType: "Trading company",
    },
  },
  {
    key: "contact.sales",
    value: {
      email: "info@oasisimpex.in",
      phone: "+91 98251 41637",
    },
  },
  {
    key: "content.banner",
    value: { title: "Oasis Impex", subtitle: "Importer & supplier of polymer raw materials", cta: "Request a quote" },
  },
];

const DEFAULT_SEO = [
  { route: "/", title: "Oasis Impex — Polymer Raw Material Importer | PVC Resin, PET Resin", metaDescription: "Oasis Impex is an established Ahmedabad-based importer and supplier of PVC Resin, PET Resin, PVC Regrind and Calcium Carbonate for pipe manufacturers and water bottling plants across India." },
  { route: "/products", title: "Products — Oasis Impex", metaDescription: "Explore our product range: PVC Resin, PET Resin, PVC Regrind and Calcium Carbonate. Consistent quality, reliable supply." },
  { route: "/contact", title: "Contact — Oasis Impex", metaDescription: "Contact Oasis Impex for polymer raw material requirements. Call or email our sales team." },
];

async function main() {
  const e = env();
  const db = createDb();

  const roles = await db
    .insert(schema.roles)
    .values(Object.keys(ROLE_PERMISSIONS).map((name) => ({ name: name as typeof schema.roles.$inferSelect.name, description: `${name.replaceAll("_", " ")} role` })))
    .onConflictDoNothing({ target: schema.roles.name })
    .returning();

  const roleId = new Map(roles.map((r) => [r.name, r.id]));
  const missing = Object.keys(ROLE_PERMISSIONS).filter((n) => !roleId.has(n as never));
  if (missing.length) throw new Error(`Failed to seed roles: ${missing.join(", ")}`);

  const perms = await db
    .insert(schema.permissions)
    .values(PERMISSION_SEEDS.map(([code, description]) => ({ code, description })))
    .onConflictDoNothing({ target: schema.permissions.code })
    .returning();

  const permByCode = new Map(perms.map((p) => [p.code, p.id]));
  for (const [roleName, codes] of Object.entries(ROLE_PERMISSIONS)) {
    const roleKey = roleName as (typeof schema.roles.$inferSelect)["name"];
    const rows = codes.filter((c) => permByCode.has(c)).map((c) => ({ roleId: roleId.get(roleKey)!, permissionId: permByCode.get(c)! }));
    if (rows.length) await db.insert(schema.rolePermissions).values(rows).onConflictDoNothing();
  }

  const passwordHash = await hash(e.SEED_ADMIN_PASSWORD, { type: 2, memoryCost: 19456, timeCost: 2, parallelism: 1 });
  const [admin] = await db
    .insert(schema.users)
    .values({ email: e.SEED_ADMIN_EMAIL, passwordHash, name: "Oasis Admin" })
    .onConflictDoNothing({ target: schema.users.email })
    .returning();
  if (admin) {
    await db.insert(schema.userRoles).values({ userId: admin.id, roleId: roleId.get("SUPER_ADMIN")! }).onConflictDoNothing();
  }

  await db.insert(schema.productCategories).values([
    { name: "PVC Resin", slug: "pvc-resin" },
    { name: "PET Resin", slug: "pet-resin" },
    { name: "PVC Regrind", slug: "pvc-regrind" },
    { name: "Calcium Carbonate", slug: "calcium-carbonate" },
  ]).onConflictDoNothing({ target: schema.productCategories.slug });

  const categories = await db.select().from(schema.productCategories);
  const catBySlug = new Map(categories.map((c) => [c.name.toUpperCase(), c.id]));

  for (const p of PRODUCT_SEEDS) {
    await db
      .insert(schema.products)
      .values({ ...p, categoryId: catBySlug.get(p.category) ?? null })
      .onConflictDoNothing({ target: schema.products.slug });
  }

  await db.insert(schema.warehouses).values([
    { name: "Ahmedabad Warehouse", code: "AHM-01", location: "Ahmedabad, Gujarat", isActive: true },
  ]).onConflictDoNothing();

  await db.insert(schema.settings).values(DEFAULT_SETTINGS).onConflictDoNothing({ target: schema.settings.key });
  await db.insert(schema.seoPages).values(DEFAULT_SEO).onConflictDoNothing({ target: schema.seoPages.route });
  await db.insert(schema.integrations).values([
    { key: "EMAIL", provider: "smtp", status: "SANDBOX" },
    { key: "WHATSAPP", provider: "sandbox", status: "SANDBOX" },
  ]).onConflictDoNothing({ target: schema.integrations.key });

  const docs = await db.insert(schema.knowledgeDocuments).values([
    { title: "About Oasis Impex", filename: "about-oasis-impex.md", source: "seed", documentType: "COMPANY", visibility: "PUBLIC", status: "INDEXED" },
    { title: "Contact & Business Hours", filename: "contact-business-hours.md", source: "seed", documentType: "COMPANY", visibility: "PUBLIC", status: "INDEXED" },
    { title: "Our Product Range Overview", filename: "product-range-overview.md", source: "seed", documentType: "BROCHURE", visibility: "PUBLIC", status: "INDEXED" },
  ]).returning();

  const company = DEFAULT_SETTINGS[0].value as { name: string; established: number; registration: Record<string, string | boolean>; offices: { address: string }[]; phones: string[]; hours: string; tagline: string };
  const productSummary = PRODUCT_SEEDS.map((p) => `${p.name}: ${p.shortDescription}`).join(" ");
  const docsById: Record<string, { content: string; visibility: string }> = {
    [docs[0].id]: { content: `${company.name} is an established importer of polymer raw materials, operating since ${company.established}. GSTIN ${String(company.registration.gstin)}, LEI ${String(company.registration.lei)}. ${company.tagline}.`, visibility: "PUBLIC" },
    [docs[1].id]: { content: `Contact Oasis Impex at ${company.phones.join(", ")}. Business hours: ${company.hours}. Registered office: ${company.offices[0].address}.`, visibility: "PUBLIC" },
    [docs[2].id]: { content: productSummary, visibility: "PUBLIC" },
  };

  for (const doc of docs) {
    const c = docsById[doc.id];
    await db.insert(schema.knowledgeChunks).values({
      documentId: doc.id,
      chunkIndex: 0,
      content: c.content,
      visibility: "PUBLIC",
      embedding: undefined,
    });
  }

  console.log(`[db] seed complete. Admin: ${e.SEED_ADMIN_EMAIL}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("[db] seed failed", err);
  process.exit(1);
});
