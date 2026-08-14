import { sql } from "drizzle-orm";
import { createDb, schema } from "@oasis/db";
import { createAIProvider } from "@oasis/ai";
import { VISIBILITY } from "@oasis/domain";
import type { Visibility } from "@oasis/domain";

export interface Chunk {
  text: string;
  heading?: string;
}

export function chunkText(text: string, maxLen = 800, overlap = 100): Chunk[] {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!normalized) return [];
  if (normalized.length <= maxLen) return [{ text: normalized }];

  const chunks: Chunk[] = [];
  let start = 0;
  while (start < normalized.length) {
    let end = Math.min(start + maxLen, normalized.length);
    if (end < normalized.length) {
      const nl = normalized.lastIndexOf("\n", end);
      const sp = normalized.lastIndexOf(" ", end);
      const cut = Math.max(nl, sp);
      if (cut > start + maxLen * 0.6) end = cut;
    }
    chunks.push({ text: normalized.slice(start, end).trim() });
    if (end === normalized.length) break;
    start = Math.max(start, end - overlap);
  }
  return chunks.filter((c) => c.text.length > 0);
}

export async function indexDocument(opts: { documentId: string; content: string; visibility: Visibility }) {
  const db = createDb();
  const ai = createAIProvider();
  const chunks = chunkText(opts.content);

  // Clear any prior chunks for this document so re-indexing is idempotent
  // (avoids duplicate/stale rows accumulating across training runs).
  await db.delete(schema.knowledgeChunks).where(sql`${schema.knowledgeChunks.documentId} = ${opts.documentId}`);

  for (let i = 0; i < chunks.length; i++) {
    const { embedding } = await ai.embed(chunks[i].text);
    await db.insert(schema.knowledgeChunks).values({
      documentId: opts.documentId,
      chunkIndex: i,
      content: chunks[i].text,
      metadata: {},
      visibility: opts.visibility,
      embedding: sql`${`[${embedding.join(",")}]`}`,
    });
  }

  await db
    .update(schema.knowledgeDocuments)
    .set({ status: "INDEXED", updatedAt: new Date() })
    .where(sql`${schema.knowledgeDocuments.id} = ${opts.documentId}`);
}

export interface RetrievedContext {
  text: string;
  documentId: string;
  title: string;
  score: number;
}

export async function retrieve(opts: {
  query: string;
  visibility: Visibility;
  limit?: number;
  scoreThreshold?: number;
}): Promise<RetrievedContext[]> {
  try {
    const db = createDb();
    const ai = createAIProvider();
    const { embedding } = await ai.embed(opts.query);

    const limit = opts.limit ?? 5;
    const threshold = opts.scoreThreshold ?? 0.4;
    const queryVec = `[${embedding.join(",")}]`;

    const rows = await db
      .select({
        id: schema.knowledgeChunks.id,
        content: schema.knowledgeChunks.content,
        score: sql<number>`1 - (${schema.knowledgeChunks.embedding} <=> ${queryVec}::vector)`,
        documentId: schema.knowledgeChunks.documentId,
        title: schema.knowledgeDocuments.title,
      })
      .from(schema.knowledgeChunks)
      .innerJoin(
        schema.knowledgeDocuments,
        sql`${schema.knowledgeChunks.documentId} = ${schema.knowledgeDocuments.id}`,
      )
      .where(sql`${schema.knowledgeChunks.visibility} = ${opts.visibility} AND ${schema.knowledgeChunks.embedding} IS NOT NULL`)
      .orderBy(sql`${schema.knowledgeChunks.embedding} <=> ${queryVec}::vector`)
      .limit(limit * 4);

    return rows
      .filter((r) => r.score >= threshold)
      .slice(0, limit)
      .map((r) => ({
        text: r.content,
        documentId: r.documentId,
        title: r.title,
        score: r.score,
      }));
  } catch (err) {
    // RAG retrieval is best-effort; return empty context on failure
    return [];
  }
}

export const PUBLIC_RETRIEVAL = VISIBILITY.PUBLIC;

export * from "./train";
