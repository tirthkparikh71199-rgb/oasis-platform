"use client";

import Image from "next/image";
import { createProduct, updateProduct, deleteImage } from "./actions";

interface ImageRow {
  id: string;
  url: string;
  alt: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface ProductInput {
  id?: string;
  name?: string | null;
  slug?: string | null;
  sku?: string | null;
  categoryId?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  unit?: string | null;
  moq?: string | null;
  origin?: string | null;
  packaging?: string | null;
  isActive?: boolean | null;
  isPublic?: boolean | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  images?: ImageRow[];
}

export function ProductForm({ categories, product }: { categories: Category[]; product?: ProductInput }) {
  const isEdit = Boolean(product?.id);
  return (
    <form action={isEdit ? updateProduct : createProduct} className="mt-6 space-y-6">
      {product?.id ? <input type="hidden" name="id" value={product.id} /> : null}
      <input type="hidden" name="slug" value={product?.slug ?? ""} />

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Basics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-slate-300">Name *</span>
            <input
              name="name"
              required
              defaultValue={product?.name ?? ""}
              placeholder="PVC Resin Grade K67"
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-300">SKU</span>
            <input
              name="sku"
              defaultValue={product?.sku ?? ""}
              placeholder="PVC-K67"
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-300">Category</span>
            <select
              name="categoryId"
              defaultValue={product?.categoryId ?? ""}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
            >
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-300">Unit</span>
            <input
              name="unit"
              defaultValue={product?.unit ?? ""}
              placeholder="MT"
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-300">MOQ</span>
            <input
              name="moq"
              defaultValue={product?.moq ?? ""}
              placeholder="1 container (25 MT)"
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-300">Origin</span>
            <input
              name="origin"
              defaultValue={product?.origin ?? ""}
              placeholder="China / India / Korea"
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-300">Packaging</span>
            <input
              name="packaging"
              defaultValue={product?.packaging ?? ""}
              placeholder="25 kg bags"
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-accent"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-slate-300">Short description</span>
            <textarea
              name="shortDescription"
              defaultValue={product?.shortDescription ?? ""}
              rows={2}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-accent"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-slate-300">Description</span>
            <textarea
              name="description"
              defaultValue={product?.description ?? ""}
              rows={5}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-accent"
            />
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Publishing</h2>
        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input name="isPublic" type="checkbox" defaultChecked={product?.isPublic ?? true} className="accent-accent" />
            Visible on public site
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input name="isActive" type="checkbox" defaultChecked={product?.isActive ?? true} className="accent-accent" />
            Active
          </label>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-slate-300">SEO title</span>
            <input
              name="seoTitle"
              defaultValue={product?.seoTitle ?? ""}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-300">SEO description</span>
            <input
              name="seoDescription"
              defaultValue={product?.seoDescription ?? ""}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
            />
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Images</h2>
        {product?.images && product.images.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-3">
            {product.images.map((img) => (
              <div key={img.id} className="group relative">
                <Image
                  src={img.url}
                  alt={img.alt ?? product.name ?? ""}
                  width={120}
                  height={90}
                  className="h-20 w-28 rounded-lg border border-white/10 object-cover"
                />
                <form action={deleteImage} className="absolute right-1 top-1">
                  <input type="hidden" name="id" value={img.id} />
                  <input type="hidden" name="productId" value={product.id} />
                  <button className="rounded bg-black/70 px-1.5 text-xs text-red-300 hover:text-red-200">×</button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No images yet.</p>
        )}
        <label className="mt-4 block">
          <span className="text-xs font-medium text-slate-300">Upload image</span>
          <input
            name="image"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            className="mt-1.5 block w-full text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-white/15"
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-accent/90"
        >
          {isEdit ? "Save changes" : "Create product"}
        </button>
        <a href="/admin/products" className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-slate-300 hover:text-white">
          Cancel
        </a>
      </div>
    </form>
  );
}
