import { eq } from "drizzle-orm";
import { createDb, schema } from "@oasis/db";
import { createAIProvider } from "@oasis/ai";
import { indexDocument } from "./index";
import type { Visibility } from "@oasis/domain";

export interface TrainingDoc {
  title: string;
  filename: string;
  source: string;
  documentType: "BROCHURE" | "SPEC" | "CERTIFICATE" | "COMPANY" | "FAQ" | "INTERNAL" | "OTHER";
  visibility: Visibility;
  content: string;
}

export function isTrainingAvailable(): boolean {
  return process.env.AI_PROVIDER === "gemini";
}

export async function trainKnowledgeBase(docs: TrainingDoc[]): Promise<{ indexed: number; skipped: number }> {
  const db = createDb();
  const ai = createAIProvider();
  let indexed = 0;
  let skipped = 0;

  for (const doc of docs) {
    const existing = await db
      .select({ id: schema.knowledgeDocuments.id })
      .from(schema.knowledgeDocuments)
      .where(eq(schema.knowledgeDocuments.filename, doc.filename))
      .limit(1);

    let id = existing[0]?.id;
    if (!id) {
      const [created] = await db
        .insert(schema.knowledgeDocuments)
        .values({
          title: doc.title,
          filename: doc.filename,
          source: doc.source,
          documentType: doc.documentType,
          visibility: doc.visibility,
          status: "PROCESSING",
        })
        .returning();
      id = created.id;
    } else {
      await db
        .update(schema.knowledgeDocuments)
        .set({ title: doc.title, documentType: doc.documentType, visibility: doc.visibility, status: "PROCESSING", updatedAt: new Date() })
        .where(eq(schema.knowledgeDocuments.id, id));
    }

    await db.delete(schema.knowledgeChunks).where(eq(schema.knowledgeChunks.documentId, id));

    if (!isTrainingAvailable()) {
      await db
        .update(schema.knowledgeDocuments)
        .set({ status: "FAILED", errorMessage: "Embedding provider not configured (set AI_PROVIDER=gemini + GEMINI_API_KEY)", updatedAt: new Date() })
        .where(eq(schema.knowledgeDocuments.id, id));
      skipped++;
      continue;
    }

    await indexDocument({ documentId: id, content: doc.content, visibility: doc.visibility });
    indexed++;
  }

  void ai;
  return { indexed, skipped };
}
