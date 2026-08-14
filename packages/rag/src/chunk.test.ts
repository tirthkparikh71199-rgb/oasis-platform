import { describe, it, expect } from "vitest";
import { chunkText } from "./index";

describe("chunkText", () => {
  it("returns empty for empty input", () => {
    expect(chunkText("")).toEqual([]);
    expect(chunkText("   \n\n ")).toEqual([]);
  });

  it("returns single chunk for short text", () => {
    const out = chunkText("Short text.");
    expect(out).toHaveLength(1);
    expect(out[0].text).toBe("Short text.");
  });

  it("splits long text with overlap and no gap", () => {
    const long = "word ".repeat(400);
    const out = chunkText(long, 200, 50);
    expect(out.length).toBeGreaterThan(1);
    const joined = out.map((c) => c.text).join(" ");
    expect(joined.length).toBeGreaterThan(long.length - out.length * 50);
    for (const c of out) expect(c.text.length).toBeLessThanOrEqual(210);
  });
});
