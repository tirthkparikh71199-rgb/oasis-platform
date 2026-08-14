import { env } from "@oasis/config";
import type { AIProvider } from "./types";
import { GeminiAIProvider } from "./gemini";
import { MockAIProvider } from "./mock";

export function createAIProvider(): AIProvider {
  const e = env();
  if (e.AI_PROVIDER === "gemini") {
    return new GeminiAIProvider(e.GEMINI_API_KEY, e.AI_MODEL, e.EMBEDDING_MODEL, e.EMBEDDING_DIM);
  }
  return new MockAIProvider();
}

export * from "./types";
export { GeminiAIProvider } from "./gemini";
export { MockAIProvider, deterministicEmbedding } from "./mock";
