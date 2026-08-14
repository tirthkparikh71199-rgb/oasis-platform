import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import * as schema from "./schema";

describe("db integration", () => {
  let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
  let pool: Pool;
  let db: ReturnType<typeof drizzle<typeof schema>>;

  beforeAll(async () => {
    container = await new PostgreSqlContainer("pgvector/pgvector:pg16")
      .withDatabase("oasis")
      .withUsername("oasis")
      .withPassword("oasis")
      .start();
    pool = new Pool({ connectionString: container.getConnectionUri() });
    db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder: "./drizzle" });
  }, 120_000);

  afterAll(async () => {
    await pool?.end();
    await container?.stop();
  });

  it("has pgvector extension available", async () => {
    const rows = await pool.query(`SELECT extname FROM pg_extension WHERE extname = 'vector'`);
    expect(rows.rows.length).toBe(1);
  });

  it("inserts and reads a product", async () => {
    const [p] = await db
      .insert(schema.products)
      .values({ name: "Test Resin", slug: "test-resin", sku: "TEST-1", shortDescription: "integration", specifications: { "K": "67" } })
      .returning();
    expect(p.id).toBeTruthy();

    const [found] = await db.select().from(schema.products).where(sql`${schema.products.slug} = 'test-resin'`);
    expect(found?.name).toBe("Test Resin");
  });

  it("inserts a chunk with a vector embedding", async () => {
    const [doc] = await db
      .insert(schema.knowledgeDocuments)
      .values({ title: "Int Doc", filename: "int.md", visibility: "PUBLIC", status: "INDEXED" })
      .returning();
    await db.insert(schema.knowledgeChunks).values({
      documentId: doc.id,
      chunkIndex: 0,
      content: "hello vector",
      visibility: "PUBLIC",
      embedding: Array(768).fill(0.01),
    });

    const rows = await db.execute(sql`SELECT count(*)::int AS n FROM knowledge_chunks WHERE document_id = ${doc.id}`);
    expect(rows.rows[0].n).toBe(1);
  });
});
