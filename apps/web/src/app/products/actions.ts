"use server";

import { redirect } from "next/navigation";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { notifyTeam } from "@/lib/notify";

const str = (f: FormData, k: string) => (f.get(k) ? String(f.get(k)).trim() : null);

export async function requestNewProduct(formData: FormData) {
  const productName = str(formData, "productName");
  if (!productName) redirect("/products?error=missing-name");

  const [request] = await db()
    .insert(schema.productRequests)
    .values({
      productName,
      gradeSpec: str(formData, "gradeSpec"),
      quantity: str(formData, "quantity"),
      unit: str(formData, "unit"),
      email: str(formData, "email"),
      phone: str(formData, "phone"),
      company: str(formData, "company"),
      message: str(formData, "message"),
    })
    .returning();

  await notifyTeam(
    "New product request from website",
    [
      { label: "Product", value: productName },
      { label: "Grade / spec", value: str(formData, "gradeSpec") },
      { label: "Quantity", value: str(formData, "quantity") },
      { label: "Company", value: str(formData, "company") },
      { label: "Name", value: null },
      { label: "Email", value: str(formData, "email") },
      { label: "Phone", value: str(formData, "phone") },
      { label: "Message", value: str(formData, "message") },
    ],
    `Track it in Admin → Products → Requests (id: ${request.id}).`,
  );

  redirect("/products?requested=1");
}
