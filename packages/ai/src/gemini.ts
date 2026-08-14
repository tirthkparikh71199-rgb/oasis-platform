import type { AIProvider, ChatMessage, ChatOptions, ChatResult, EmbedOptions, EmbedResult } from "./types";

const GENERATE_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const EMBED_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

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
      role: m.role === "system" ? "user" : m.role,
      parts: [{ text: m.content }],
    }));

    const res = await fetch(url, {
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
      inputTokens: data.usageMetadata?.promptTokenCount ?? 0,
      outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
      latencyMs: Date.now() - start,
    };
  }

  async embed(text: string, opts: EmbedOptions = {}): Promise<EmbedResult> {
    const start = Date.now();
    const url = `${EMBED_ENDPOINT}/${this.embedModel}:embedContent?key=${this.apiKey}`;
    const res = await fetch(url, {
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

    return { embedding, inputTokens: data.usageMetadata?.promptTokenCount ?? 0, latencyMs: Date.now() - start };
  }
}
