"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { writeFile, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";
import { randomUUID } from "node:crypto";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";

const str = (f: FormData, k: string) => (f.get(k) ? String(f.get(k)).trim() : null);

export async function createProduct(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "catalog.write", "/admin/products");
  const name = str(formData, "name");
  if (!name) redirect("/admin/products?error=missing-name");
  const slug = str(formData, "slug") ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const product = await db()
    .insert(schema.products)
    .values({
      name,
      slug,
      sku: str(formData, "sku"),
      categoryId: str(formData, "categoryId"),
      shortDescription: str(formData, "shortDescription"),
      description: str(formData, "description"),
      unit: str(formData, "unit"),
      moq: str(formData, "moq"),
      origin: str(formData, "origin"),
      packaging: str(formData, "packaging"),
      isActive: formData.get("isActive") === "on",
      isPublic: formData.get("isPublic") === "on",
      seoTitle: str(formData, "seoTitle"),
      seoDescription: str(formData, "seoDescription"),
    })
    .returning({ id: schema.products.id });

  await handleImage(formData, product[0].id);
  revalidatePath("/products");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "catalog.write", "/admin/products");
  const id = str(formData, "id");
  if (!id) redirect("/admin/products?error=missing-id");
  const name = str(formData, "name");
  if (!name) redirect("/admin/products?error=missing-name");

  await db()
    .update(schema.products)
    .set({
      name,
      slug: str(formData, "slug") ?? undefined,
      sku: str(formData, "sku"),
      categoryId: str(formData, "categoryId"),
      shortDescription: str(formData, "shortDescription"),
      description: str(formData, "description"),
      unit: str(formData, "unit"),
      moq: str(formData, "moq"),
      origin: str(formData, "origin"),
      packaging: str(formData, "packaging"),
      isActive: formData.get("isActive") === "on",
      isPublic: formData.get("isPublic") === "on",
      seoTitle: str(formData, "seoTitle"),
      seoDescription: str(formData, "seoDescription"),
      updatedAt: sql`now()`,
    })
    .where(eq(schema.products.id, id));

  await handleImage(formData, id);
  revalidatePath("/products");
  revalidatePath("/products/" + (str(formData, "slug") ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-")));
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/" + id);
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "catalog.write", "/admin/products");
  const id = str(formData, "id");
  if (id) await db().delete(schema.products).where(eq(schema.products.id, id));
  revalidatePath("/products");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteImage(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "catalog.write", "/admin/products");
  const id = str(formData, "id");
  const productId = str(formData, "productId");
  if (id) await db().delete(schema.productImages).where(eq(schema.productImages.id, id));
  if (productId) {
    revalidatePath("/admin/products/" + productId);
    revalidatePath("/products");
  }
  redirect("/admin/products/" + (productId ?? ""));
}

async function handleImage(formData: FormData, productId: string) {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return;
  const ext = extname(file.name) || ".png";
  const safe = [".png", ".jpg", ".jpeg", ".webp", ".avif"].includes(ext.toLowerCase()) ? ext.toLowerCase() : ".png";
  const filename = `${randomUUID()}${safe}`;
  const dir = join(process.cwd(), "public", "uploads", "products", productId);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), Buffer.from(await file.arrayBuffer()));

  const count = await db()
    .select({ n: sql<number>`count(*)::int` })
    .from(schema.productImages)
    .where(eq(schema.productImages.productId, productId));
  await db().insert(schema.productImages).values({
    productId,
    url: `/uploads/products/${productId}/${filename}`,
    sortOrder: count[0].n,
  });
}
