import { createAIProvider as createFallbackProvider } from "./fallback";

export function createAIProvider() {
  return createFallbackProvider();
}

export * from "./types";
export { GeminiAIProvider } from "./gemini";
export { MockAIProvider, deterministicEmbedding } from "./mock";
