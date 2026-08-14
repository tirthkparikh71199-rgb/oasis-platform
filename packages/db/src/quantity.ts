export function parseQuantity(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatQuantity(value: string | number | null | undefined, unit?: string): string {
  const n = parseQuantity(value);
  const formatted = Number.isInteger(n) ? String(n) : n.toFixed(4).replace(/\.?0+$/, "");
  return unit ? `${formatted} ${unit}` : formatted;
}

export function stockStatus(quantity: number, threshold: number | null | undefined): "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK" {
  if (quantity <= 0) return "OUT_OF_STOCK";
  if (threshold !== null && threshold !== undefined && quantity <= threshold) return "LOW_STOCK";
  return "AVAILABLE";
}
