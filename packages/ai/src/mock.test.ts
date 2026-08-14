import { describe, it, expect } from "vitest";
import { MockAIProvider } from "./mock";

describe("MockAIProvider", () => {
  it("answers PVC questions with product info", async () => {
    const p = new MockAIProvider();
    const res = await p.chat([{ role: "user", content: "Do you supply PVC resin?" }]);
    expect(res.text.toLowerCase()).toContain("pvc");
    expect(res.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("falls back for unknown questions", async () => {
    const p = new MockAIProvider();
    const res = await p.chat([{ role: "user", content: "qqqqzzz unknown topic" }]);
    expect(res.text).toBeTruthy();
  });

  it("embeds deterministically", async () => {
    const p = new MockAIProvider();
    const a = await p.embed("hello world");
    const b = await p.embed("hello world");
    expect(a.embedding).toEqual(b.embedding);
    expect(a.embedding).toHaveLength(64);
  });
});
