import { describe, it, expect } from "vitest";
import { parseQuantity, formatQuantity, stockStatus } from "./quantity";

describe("quantity helpers", () => {
  it("parses strings, numbers and empty values", () => {
    expect(parseQuantity("25")).toBe(25);
    expect(parseQuantity(12.5)).toBe(12.5);
    expect(parseQuantity(null)).toBe(0);
    expect(parseQuantity("")).toBe(0);
    expect(parseQuantity("abc")).toBe(0);
  });

  it("formats with unit and trims trailing zeros", () => {
    expect(formatQuantity("25.0000", "MT")).toBe("25 MT");
    expect(formatQuantity("25.5000")).toBe("25.5");
    expect(formatQuantity(0)).toBe("0");
  });

  it("derives stock status from threshold", () => {
    expect(stockStatus(0, 5)).toBe("OUT_OF_STOCK");
    expect(stockStatus(3, 5)).toBe("LOW_STOCK");
    expect(stockStatus(50, 5)).toBe("AVAILABLE");
    expect(stockStatus(2, null)).toBe("AVAILABLE");
  });
});
