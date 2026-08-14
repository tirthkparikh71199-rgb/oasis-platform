import dns from "node:dns";
import type { AIProvider, ChatMessage, ChatOptions, ChatResult, EmbedOptions, EmbedResult } from "./types";

// Node 18+ resolves IPv6 (AAAA) first by default. On many hosts the IPv6 route to
// Google's API stalls, so the first fetch hangs until it slowly falls back to IPv4.
// Forcing IPv4-first makes outbound Gemini calls connect immediately and reliably.
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // older Node without this API — safe to ignore
}

const GENERATE_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const EMBED_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const REQUEST_TIMEOUT_MS = 15_000;

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`Gemini request timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export class GeminiAIProvider implements AIProvider {
  readonly name = "gemini";

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly embedModel: string,
    private readonly embedDim: number,
  ) {}

  isConfigured(): boolean {
    return Boolean(this.apiKey) && this.apiKey.length > 0;
  }

  async chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<ChatResult> {
    const start = Date.now();
    const url = `${GENERATE_ENDPOINT}/${this.model}:generateContent?key=${this.apiKey}`;
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction:
          messages.find((m) => m.role === "system") && opts !== undefined
            ? { parts: [{ text: messages.find((m) => m.role === "system")!.content }] }
            : undefined,
        generationConfig: {
          temperature: opts.temperature ?? 0.4,
          maxOutputTokens: opts.maxOutputTokens ?? 512,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Gemini chat failed (${res.status}): ${body.slice(0, 300)}`);
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
    };

    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    if (!text) throw new Error("Gemini returned empty response");

    return {
      text,
      inputTokens: Math.ceil(data.usageMetadata?.promptTokenCount ?? 0),
      outputTokens: Math.ceil(data.usageMetadata?.candidatesTokenCount ?? 0),
      latencyMs: Date.now() - start,
    };
  }

  async embed(text: string, opts: EmbedOptions = {}): Promise<EmbedResult> {
    const start = Date.now();
    const url = `${EMBED_ENDPOINT}/${this.embedModel}:embedContent?key=${this.apiKey}`;
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${this.embedModel}`,
        content: { parts: [{ text }] },
        outputDimensionality: opts.dimensions ?? this.embedDim,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Gemini embed failed (${res.status}): ${body.slice(0, 300)}`);
    }

    const data = (await res.json()) as { embedding?: { values?: number[] }; usageMetadata?: { promptTokenCount?: number } };
    const embedding = data.embedding?.values;
    if (!embedding) throw new Error("Gemini returned no embedding");

    return { embedding, inputTokens: Math.ceil(data.usageMetadata?.promptTokenCount ?? 0), latencyMs: Date.now() - start };
  }
}
