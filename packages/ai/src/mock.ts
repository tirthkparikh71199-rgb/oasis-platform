import type { AIProvider, ChatMessage, ChatOptions, ChatResult, EmbedResult, EmbedOptions } from "./types";

const MOCK_RESPONSES: [RegExp, string][] = [
  [/pvc|polyvinyl/i, "We supply PVC Resin in grades such as K67 and K57, imported from established producers in Thailand and China and supplied in 25 kg bags. Would you like a quote for your requirement?"],
  [/k67/i, "PVC Resin K67 is our general-purpose suspension grade for rigid pipes, profiles and fittings. We can share specifications and current availability."],
  [/k57/i, "PVC Resin K57 is a lower-K suspension grade ideal for flexible compounds, flooring and hoses."],
  [/regrind/i, "We supply graded rigid PVC regrind for reuse in pipe and profile manufacturing, with consistent particle size and purity."],
  [/pet|bottle/i, "We supply bottle-grade PET Resin (IV 0.80) for drinking-water and beverage bottles and preforms, backed by food-contact certifications for packaging use."],
  [/calcium|ca[co]{2}/i, "We supply calcium carbonate powder in multiple mesh sizes, including surface-treated grades for PVC compounding and masterbatch."],
  [/price|cost|rate/i, "Pricing depends on grade, quantity and current market. Please share your requirement and our sales team will respond with an exact quotation."],
  [/deliver|shipping|dispatch|logistic/i, "We coordinate pan-India dispatch from our Ahmedabad operations. Delivery timelines depend on destination and quantity."],
  [/contact|phone|call|email|reach/i, "You can reach us at +91 98251 41637 (or +91 98250 59778) between 10:30 and 18:00 IST, Mon–Sat. You can also raise a handoff request from this chat and a sales agent will call you."],
  [/address|office|where|located/i, "Our head office is at 510, City Center, Opp. Shukan Mall, Science City Road, Ahmedabad, Gujarat 380060. Our warehouse is at Shed 10 & 11, Mahalaxmi Industrial Compound, Kothari Industrial Estate, Santej, Kalol, Gandhinagar 382721."],
  [/hello|hi\b|hey/i, "Hello! I'm the Oasis Impex assistant. I can help with our products — PVC Resin, PVC Regrind, PET Resin and Calcium Carbonate — availability, and connecting you to our sales team."],
];

const FALLBACK = "I'll check that with our team and get back to you. If you'd like, you can share your contact details and I'll have a sales agent call you right away.";

export class MockAIProvider implements AIProvider {
  readonly name = "mock";
  private latency = 60;

  isConfigured(): boolean {
    return true;
  }

  async chat(messages: ChatMessage[], _opts?: ChatOptions): Promise<ChatResult> {
    const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const start = Date.now();
    const found = MOCK_RESPONSES.find(([re]) => re.test(lastUser));
    const text = found ? found[1] : FALLBACK;
    await sleep(this.latency);
    return { text, inputTokens: lastUser.length / 4, outputTokens: text.length / 4, latencyMs: Date.now() - start };
  }

  async embed(text: string, _opts?: EmbedOptions): Promise<EmbedResult> {
    const start = Date.now();
    await sleep(20);
    return { embedding: deterministicEmbedding(text), inputTokens: text.length / 4, latencyMs: Date.now() - start };
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function deterministicEmbedding(text: string): number[] {
  const dim = 64;
  const out = new Array<number>(dim).fill(0);
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    out[i % dim] += (code % 101) / 100;
  }
  const norm = Math.sqrt(out.reduce((a, b) => a + b * b, 0)) || 1;
  return out.map((v) => v / norm);
}
