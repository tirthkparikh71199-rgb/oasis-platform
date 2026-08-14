import { sql } from "drizzle-orm";
import { createDb, schema } from "./src";
const db = createDb();
const q = db
  .insert(schema.knowledgeChunks)
  .values({
    documentId: "x",
    chunkIndex: 0,
    content: "c",
    visibility: "PUBLIC",
    embedding: sql`${`[${Array(4).fill(0.01).join(",")}]`}`,
  })
  .toSQL();
console.log(JSON.stringify(q, null, 2));
const r = db
  .select({ id: schema.knowledgeChunks.id, score: sql<number>`1 - (${schema.knowledgeChunks.embedding} <=> ${"[0.1,0.2]"}::vector)` })
  .from(schema.knowledgeChunks)
  .toSQL();
console.log(r.sql);
