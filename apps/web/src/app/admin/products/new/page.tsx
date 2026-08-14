import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { ProductForm } from "../product-form";

export const metadata = { title: "New product | Oasis Impex Admin" };

export default async function NewProductPage() {
  const categories = await db().select().from(schema.productCategories).orderBy(schema.productCategories.sortOrder);
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">New product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
