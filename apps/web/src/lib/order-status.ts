export const ORDER_STATUS_FLOW = ["NEW", "CONFIRMED", "IN_PROGRESS", "SHIPPED", "DELIVERED"] as const;
export type OrderStatus = (typeof ORDER_STATUS_FLOW)[number] | "CANCELLED";

export const ORDER_STATUS_STYLES: Record<string, string> = {
  NEW: "bg-sky-500/10 text-sky-300",
  CONFIRMED: "bg-indigo-500/10 text-indigo-300",
  IN_PROGRESS: "bg-amber-500/10 text-amber-300",
  SHIPPED: "bg-violet-500/10 text-violet-300",
  DELIVERED: "bg-emerald-500/10 text-emerald-300",
  CANCELLED: "bg-red-500/10 text-red-300",
};
