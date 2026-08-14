import { describe, it, expect } from "vitest";
import { formatOrderNumber } from "./order-number";
import { ORDER_STATUS_FLOW } from "./order-status";

describe("formatOrderNumber", () => {
  it("zero-pads the sequence to 4 digits", () => {
    expect(formatOrderNumber(2026, 1)).toBe("ORD-2026-0001");
    expect(formatOrderNumber(2026, 42)).toBe("ORD-2026-0042");
    expect(formatOrderNumber(2026, 9999)).toBe("ORD-2026-9999");
  });
});

describe("ORDER_STATUS_FLOW", () => {
  it("covers the full lifecycle in order", () => {
    expect(ORDER_STATUS_FLOW).toEqual(["NEW", "CONFIRMED", "IN_PROGRESS", "SHIPPED", "DELIVERED"]);
  });
});
