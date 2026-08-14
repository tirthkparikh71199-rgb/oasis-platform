import { env } from "@oasis/config";
import type { AIProvider, ChatMessage, ChatResult, EmbedResult } from "./types";
import { GeminiAIProvider } from "./gemini";
import { MockAIProvider } from "./mock";
import { createLogger } from "@oasis/logger";

const log = createLogger("ai-fallback");

let rateLimitHits = 0;
let lastRateLimit = 0;
const RATE_LIMIT_THRESHOLD = 3;
const RATE_LIMIT_COOLDOWN_MS = 60_000;

export function createAIProvider(): AIProvider {
  const e = env();

  if (rateLimitHits >= RATE_LIMIT_THRESHOLD) {
    const timeSinceLastHit = Date.now() - lastRateLimit;
    if (timeSinceLastHit < RATE_LIMIT_COOLDOWN_MS) {
      log.warn({ rateLimitHits }, "AI rate limited, using mock provider");
      return new MockAIProvider();
    }
    rateLimitHits = 0;
  }

  if (e.AI_PROVIDER === "gemini" && e.GEMINI_API_KEY) {
    return new RateLimitAwareProvider(new GeminiAIProvider(e.GEMINI_API_KEY, e.AI_MODEL, e.EMBEDDING_MODEL, e.EMBEDDING_DIM));
  }

  return new MockAIProvider();
}

class RateLimitAwareProvider implements AIProvider {
  readonly name = "rate-limit-aware";
  private mock = new MockAIProvider();

  constructor(private primary: AIProvider) {}

  get isConfigured() { return this.primary.isConfigured; }

  async chat(messages: ChatMessage[], opts?: Parameters<AIProvider["chat"]>[1]): Promise<ChatResult> {
    try {
      return await this.primary.chat(messages, opts);
    } catch (err) {
      const errStr = err instanceof Error ? err.message : String(err);
      if (errStr.includes("429") || errStr.includes("rate") || errStr.includes("quota") || errStr.includes("timed out") || errStr.includes("timeout") || errStr.includes("fetch failed") || errStr.includes("ECONNRESET") || errStr.includes("ETIMEDOUT")) {
        rateLimitHits++;
        lastRateLimit = Date.now();
        log.warn({ rateLimitHits }, "Gemini rate limited, falling back to mock");
        return this.mock.chat(messages, opts);
      }
      throw err;
    }
  }

  async embed(text: string, opts?: Parameters<AIProvider["embed"]>[1]): Promise<EmbedResult> {
    try {
      return await this.primary.embed(text, opts);
    } catch (err) {
      const errStr = err instanceof Error ? err.message : String(err);
      if (errStr.includes("429") || errStr.includes("rate") || errStr.includes("quota") || errStr.includes("timed out") || errStr.includes("timeout") || errStr.includes("fetch failed") || errStr.includes("ECONNRESET") || errStr.includes("ETIMEDOUT")) {
        rateLimitHits++;
        lastRateLimit = Date.now();
        log.warn({ rateLimitHits }, "Gemini embed rate limited, falling back to mock");
        return this.mock.embed(text, opts);
      }
      throw err;
    }
  }
}
