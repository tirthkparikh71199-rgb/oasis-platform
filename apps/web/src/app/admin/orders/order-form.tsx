"use client";

import { createOrder, updateOrder } from "./actions";

interface OrderInput {
  id?: string;
  customerId?: string | null;
  productId?: string | null;
  quantity?: string | null;
  unit?: string | null;
  status?: string | null;
  expectedDate?: string | null;
  notes?: string | null;
}

const STATUS_OPTIONS = ["NEW", "CONFIRMED", "IN_PROGRESS", "SHIPPED", "DELIVERED", "CANCELLED"];

interface SelectOption {
  id: string;
  name: string;
}

export function OrderForm({
  order,
  customers,
  products,
}: {
  order?: OrderInput;
  customers: SelectOption[];
  products: SelectOption[];
}) {
  const isEdit = Boolean(order?.id);
  return (
    <form action={isEdit ? updateOrder : createOrder} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">{isEdit ? "Edit order" : "New order"}</h2>
      {order?.id ? <input type="hidden" name="id" value={order.id} /> : null}
      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="text-xs font-medium text-slate-300">Customer *</span>
          <select
            name="customerId"
            required
            defaultValue={order?.customerId ?? ""}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
          >
            <option value="" disabled>
              Select customer
            </option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-300">Product</span>
          <select
            name="productId"
            defaultValue={order?.productId ?? ""}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
          >
            <option value="">— None —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-medium text-slate-300">Quantity</span>
            <input
              name="quantity"
              defaultValue={order?.quantity ?? ""}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-300">Unit</span>
            <input
              name="unit"
              placeholder="MT"
              defaultValue={order?.unit ?? ""}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-300">Expected date</span>
            <input
              name="expectedDate"
              type="date"
              defaultValue={order?.expectedDate ?? ""}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-xs font-medium text-slate-300">Status</span>
          <select
            name="status"
            defaultValue={order?.status ?? "NEW"}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-300">Notes</span>
          <textarea
            name="notes"
            defaultValue={order?.notes ?? ""}
            rows={3}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-accent/90"
        >
          {isEdit ? "Save changes" : "Create order"}
        </button>
      </div>
    </form>
  );
}
