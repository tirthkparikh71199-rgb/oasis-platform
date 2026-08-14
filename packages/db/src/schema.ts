import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  integer,
  numeric,
  timestamp,
  date,
  inet,
  index,
  uniqueIndex,
  jsonb,
  primaryKey,
  vector,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const roleEnum = pgEnum("role", [
  "SUPER_ADMIN",
  "ADMIN",
  "SALES",
  "INVENTORY_MANAGER",
  "KNOWLEDGE_MANAGER",
  "AGENT",
  "VIEWER",
]);

export const visibilityEnum = pgEnum("visibility", ["PUBLIC", "INTERNAL", "CONFIDENTIAL"]);

export const knowledgeStatusEnum = pgEnum("knowledge_status", [
  "UPLOADED",
  "PROCESSING",
  "INDEXED",
  "FAILED",
]);

export const documentTypeEnum = pgEnum("document_type", [
  "BROCHURE",
  "SPEC",
  "CERTIFICATE",
  "COMPANY",
  "FAQ",
  "INTERNAL",
  "OTHER",
]);

export const stockStatusEnum = pgEnum("stock_status", [
  "AVAILABLE",
  "LOW_STOCK",
  "OUT_OF_STOCK",
  "IN_TRANSIT",
]);

export const movementTypeEnum = pgEnum("movement_type", [
  "RECEIVED",
  "TRANSFERRED",
  "ADJUSTED",
  "DISPATCHED",
]);

export const customerStatusEnum = pgEnum("customer_status", ["ACTIVE", "LEAD", "INACTIVE"]);
export const vendorStatusEnum = pgEnum("vendor_status", ["ACTIVE", "INACTIVE"]);
export const mappingStatusEnum = pgEnum("mapping_status", ["INTERESTED", "APPROVED", "PURCHASING"]);

export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "IN_PROGRESS",
  "CONVERTED",
  "CLOSED",
]);

export const inquirySourceEnum = pgEnum("inquiry_source", ["WEB", "CHAT", "WHATSAPP", "EMAIL"]);

export const channelEnum = pgEnum("channel", ["WEB", "WHATSAPP", "EMAIL"]);

export const conversationStatusEnum = pgEnum("conversation_status", [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
]);

export const messageSenderEnum = pgEnum("message_sender", ["USER", "BOT", "AGENT", "SYSTEM"]);
export const messageDirectionEnum = pgEnum("message_direction", ["INBOUND", "OUTBOUND"]);

export const handoffStatusEnum = pgEnum("handoff_status", [
  "NEW",
  "QUEUED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
]);

export const handoffPriorityEnum = pgEnum("handoff_priority", ["LOW", "MEDIUM", "HIGH"]);

export const integrationStatusEnum = pgEnum("integration_status", [
  "CONFIGURED",
  "SANDBOX",
  "ERROR",
]);

// ---------------------------------------------------------------------------
// Identity & Auth
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: roleEnum("name").notNull().unique(),
  description: text("description"),
});

export const permissions = pgTable("permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  description: text("description"),
});

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })],
);

export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.roleId] })],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ip: inet("ip"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (t) => [index("sessions_expires_idx").on(t.expiresAt)],
);

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export const productCategories = pgTable("product_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
});

export const brands = pgTable("brands", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    sku: text("sku"),
    categoryId: uuid("category_id").references(() => productCategories.id, { onDelete: "set null" }),
    brandId: uuid("brand_id").references(() => brands.id, { onDelete: "set null" }),
    shortDescription: text("short_description"),
    description: text("description"),
    specifications: jsonb("specifications").$type<Record<string, string>>().default({}),
    applications: jsonb("applications").$type<string[]>().default([]),
    industries: jsonb("industries").$type<string[]>().default([]),
    origin: text("origin"),
    packaging: text("packaging"),
    unit: text("unit"),
    moq: text("moq"),
    isActive: boolean("is_active").notNull().default(true),
    isPublic: boolean("is_public").notNull().default(true),
    availabilityPublic: boolean("availability_public").notNull().default(true),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    ogImage: text("og_image"),
    canonicalUrl: text("canonical_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("products_category_idx").on(t.categoryId),
    index("products_brand_idx").on(t.brandId),
    uniqueIndex("products_sku_idx").on(t.sku),
  ],
);

export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: text("alt"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productDocuments = pgTable("product_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  fileType: text("file_type"),
  sizeBytes: integer("size_bytes"),
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Inventory (INTERNAL)
// ---------------------------------------------------------------------------

export const warehouses = pgTable("warehouses", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code").unique(),
  location: text("location"),
  address: text("address"),
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  isPublicAddress: boolean("is_public_address").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const inventory = pgTable(
  "inventory",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouses.id, { onDelete: "restrict" }),
    quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull().default("0"),
    reservedQuantity: numeric("reserved_quantity", { precision: 18, scale: 4 }).notNull().default("0"),
    unit: text("unit"),
    status: stockStatusEnum("status").notNull().default("AVAILABLE"),
    lowStockThreshold: numeric("low_stock_threshold", { precision: 18, scale: 4 }),
    lastUpdated: timestamp("last_updated", { withTimezone: true }).notNull().defaultNow(),
    notes: text("notes"),
    updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  },
  (t) => [
    uniqueIndex("inventory_product_warehouse_idx").on(t.productId, t.warehouseId),
    index("inventory_warehouse_idx").on(t.warehouseId),
    index("inventory_status_idx").on(t.status),
  ],
);

export const inventoryBatches = pgTable("inventory_batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  inventoryId: uuid("inventory_id")
    .notNull()
    .references(() => inventory.id, { onDelete: "cascade" }),
  batchNumber: text("batch_number").notNull(),
  quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull().default("0"),
  receivedDate: date("received_date"),
  expiryDate: date("expiry_date"),
  source: text("source"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const inventoryMovements = pgTable(
  "inventory_movements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouses.id, { onDelete: "restrict" }),
    type: movementTypeEnum("type").notNull(),
    quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull(),
    fromWarehouseId: uuid("from_warehouse_id").references(() => warehouses.id, { onDelete: "set null" }),
    toWarehouseId: uuid("to_warehouse_id").references(() => warehouses.id, { onDelete: "set null" }),
    batchNumber: text("batch_number"),
    reason: text("reason"),
    notes: text("notes"),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("movements_product_warehouse_idx").on(t.productId, t.warehouseId),
    index("movements_created_idx").on(t.createdAt),
  ],
);

// ---------------------------------------------------------------------------
// Partners (INTERNAL)
// ---------------------------------------------------------------------------

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  company: text("company"),
  email: text("email"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  location: text("location"),
  industry: text("industry"),
  status: customerStatusEnum("status").notNull().default("LEAD"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const customerContacts = pgTable("customer_contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  designation: text("designation"),
  isPrimary: boolean("is_primary").notNull().default(false),
});

export const vendors = pgTable("vendors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  company: text("company"),
  country: text("country"),
  email: text("email"),
  phone: text("phone"),
  contactName: text("contact_name"),
  status: vendorStatusEnum("status").notNull().default("ACTIVE"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Mappings (INTERNAL)
// ---------------------------------------------------------------------------

export const customerProducts = pgTable(
  "customer_products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    status: mappingStatusEnum("status").notNull().default("INTERESTED"),
  },
  (t) => [uniqueIndex("customer_product_idx").on(t.customerId, t.productId)],
);

export const vendorProducts = pgTable(
  "vendor_products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    brandId: uuid("brand_id").references(() => brands.id, { onDelete: "set null" }),
  },
  (t) => [uniqueIndex("vendor_product_idx").on(t.vendorId, t.productId)],
);

export const warehouseProducts = pgTable(
  "warehouse_products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouses.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
  },
  (t) => [uniqueIndex("warehouse_product_idx").on(t.warehouseId, t.productId)],
);

// ---------------------------------------------------------------------------
// Leads & engagement
// ---------------------------------------------------------------------------

export const inquiries = pgTable(
  "inquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    company: text("company"),
    email: text("email"),
    phone: text("phone"),
    whatsapp: text("whatsapp"),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    quantityRequested: text("quantity_requested"),
    message: text("message"),
    source: inquirySourceEnum("source").notNull().default("WEB"),
    status: inquiryStatusEnum("status").notNull().default("NEW"),
    assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("inquiries_status_idx").on(t.status, t.createdAt)],
);

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    channel: channelEnum("channel").notNull().default("WEB"),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    externalId: text("external_id"),
    status: conversationStatusEnum("status").notNull().default("OPEN"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("conversations_channel_status_idx").on(t.channel, t.status)],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderType: messageSenderEnum("sender_type").notNull(),
    channel: channelEnum("channel").notNull().default("WEB"),
    direction: messageDirectionEnum("direction").notNull(),
    content: text("content").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("messages_conversation_idx").on(t.conversationId, t.createdAt)],
);

export const conversationParticipants = pgTable("conversation_participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id").references(() => customers.id, { onDelete: "cascade" }),
});

export const handoffs = pgTable(
  "handoffs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    inquiryId: uuid("inquiry_id").references(() => inquiries.id, { onDelete: "set null" }),
    status: handoffStatusEnum("status").notNull().default("NEW"),
    priority: handoffPriorityEnum("priority").notNull().default("MEDIUM"),
    assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
    initiatedBy: messageSenderEnum("initiated_by").notNull().default("BOT"),
    reason: text("reason"),
    aiSummary: text("ai_summary"),
    transcriptRef: text("transcript_ref"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (t) => [index("handoffs_status_priority_idx").on(t.status, t.priority)],
);

// ---------------------------------------------------------------------------
// RAG
// ---------------------------------------------------------------------------

export const knowledgeDocuments = pgTable(
  "knowledge_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    filename: text("filename").notNull(),
    source: text("source"),
    documentType: documentTypeEnum("document_type").notNull().default("OTHER"),
    visibility: visibilityEnum("visibility").notNull().default("PUBLIC"),
    ownerId: uuid("owner_id").references(() => users.id, { onDelete: "set null" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    version: integer("version").notNull().default(1),
    hash: text("hash"),
    status: knowledgeStatusEnum("status").notNull().default("UPLOADED"),
    storageKey: text("storage_key"),
    errorMessage: text("error_message"),
    uploadedBy: uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("knowledge_visibility_status_idx").on(t.visibility, t.status)],
);

export const knowledgeChunks = pgTable(
  "knowledge_chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => knowledgeDocuments.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    content: text("content").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    visibility: visibilityEnum("visibility").notNull(),
    embedding: vector("embedding", { dimensions: 768 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("chunks_visibility_idx").on(t.visibility),
    index("chunks_embedding_hnsw_idx")
      .using("hnsw", t.embedding.op("vector_cosine_ops"))
      .where(sql`embedding IS NOT NULL`),
  ],
);

// ---------------------------------------------------------------------------
// System
// ---------------------------------------------------------------------------

export const aiUsage = pgTable(
  "ai_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: text("provider").notNull(),
    model: text("model").notNull(),
    operation: text("operation").notNull(), // CHAT | EMBED
    inputTokens: integer("input_tokens").default(0),
    outputTokens: integer("output_tokens").default(0),
    latencyMs: integer("latency_ms").default(0),
    success: boolean("success").notNull().default(true),
    errorCode: text("error_code"),
    conversationId: uuid("conversation_id").references(() => conversations.id, { onDelete: "set null" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ai_usage_created_idx").on(t.createdAt)],
);

export const integrations = pgTable("integrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(), // EMAIL | WHATSAPP
  provider: text("provider").notNull(),
  status: integrationStatusEnum("status").notNull().default("SANDBOX"),
  config: jsonb("config").$type<Record<string, unknown>>().default({}),
  lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  status: text("status").notNull().default("queued"), // queued|active|completed|failed|retry
  payload: jsonb("payload").$type<Record<string, unknown>>().default({}),
  attempts: integer("attempts").notNull().default(0),
  error: text("error"),
  runAt: timestamp("run_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    actorType: text("actor_type").notNull().default("USER"), // USER | SYSTEM
    action: text("action").notNull(),
    entity: text("entity"),
    entityId: text("entity_id"),
    ip: inet("ip"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_created_idx").on(t.createdAt)],
);

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<unknown>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const seoPages = pgTable("seo_pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  route: text("route").notNull().unique(),
  title: text("title"),
  metaDescription: text("meta_description"),
  canonical: text("canonical"),
  ogImage: text("og_image"),
  focusKeywords: text("focus_keywords"),
  robotsIndex: boolean("robots_index").notNull().default(true),
  robotsFollow: boolean("robots_follow").notNull().default(true),
  schema: jsonb("schema").$type<Record<string, unknown>>(),
  content: jsonb("content").$type<Record<string, unknown>>().default({}),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Handoff = typeof handoffs.$inferSelect;
export type KnowledgeDocument = typeof knowledgeDocuments.$inferSelect;
