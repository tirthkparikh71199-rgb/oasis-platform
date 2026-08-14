"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const str = (f: FormData, k: string) => (f.get(k) ? String(f.get(k)).trim() : null);
const num = (f: FormData, k: string) => { const v = f.get(k); return v ? Number(v) : null; };

export async function createTestimonial(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "settings.write", "/admin/testimonials");
  const customerName = str(formData, "customerName");
  const quote = str(formData, "quote");
  if (!customerName || !quote) redirect("/admin/testimonials?error=missing-fields");
  await db().insert(schema.testimonials).values({
    customerName,
    company: str(formData, "company"),
    quote,
    rating: num(formData, "rating") ?? 5,
    isPublished: formData.get("isPublished") === "on",
    sortOrder: num(formData, "sortOrder") ?? 0,
  });
  await logAudit({ actorUserId: user.id, action: "TESTIMONIAL_CREATED", entity: "testimonials", metadata: { customerName } });
  revalidatePath("/admin/testimonials");
  redirect("/admin/testimonials?created=1");
}

export async function updateTestimonial(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "settings.write", "/admin/testimonials");
  const id = str(formData, "id");
  if (!id) redirect("/admin/testimonials");
  await db().update(schema.testimonials).set({
    customerName: str(formData, "customerName") ?? undefined,
    company: str(formData, "company"),
    quote: str(formData, "quote") ?? undefined,
    rating: num(formData, "rating"),
    isPublished: formData.get("isPublished") === "on",
    sortOrder: num(formData, "sortOrder"),
  }).where(eq(schema.testimonials.id, id));
  await logAudit({ actorUserId: user.id, action: "TESTIMONIAL_UPDATED", entity: "testimonials", entityId: id });
  revalidatePath("/admin/testimonials");
  redirect("/admin/testimonials?updated=1");
}

export async function deleteTestimonial(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "settings.manage", "/admin/testimonials");
  const id = str(formData, "id");
  if (id) {
    await db().delete(schema.testimonials).where(eq(schema.testimonials.id, id));
    await logAudit({ actorUserId: user.id, action: "TESTIMONIAL_DELETED", entity: "testimonials", entityId: id });
  }
  revalidatePath("/admin/testimonials");
  redirect("/admin/testimonials");
}
