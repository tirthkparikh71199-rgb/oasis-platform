import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { ProductForm } from "../product-form";

export const metadata = { title: "Edit product | Oasis Impex Admin" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dbs = db();
  const [product, categories, images] = await Promise.all([
    dbs.query.products.findFirst({ where: eq(schema.products.id, id) }),
    dbs.select().from(schema.productCategories).orderBy(schema.productCategories.sortOrder),
    dbs.select().from(schema.productImages).where(eq(schema.productImages.productId, id)).orderBy(asc(schema.productImages.sortOrder)),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Edit product</h1>
      <ProductForm categories={categories} product={{ ...product, images }} />
    </div>
  );
}
