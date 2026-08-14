export function formatOrderNumber(year: number, count: number): string {
  return `ORD-${year}-${String(count).padStart(4, "0")}`;
}
