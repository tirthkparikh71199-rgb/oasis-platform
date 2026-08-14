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
import { logAudit } from "@/lib/audit";

const str = (f: FormData, k: string) => (f.get(k) ? String(f.get(k)).trim() : null);

async function handleLogoUpload(formData: FormData, vendorId: string): Promise<string | null> {
  const file = formData.get("logo") as File | null;
  if (!file || file.size === 0) return null;
  const ext = extname(file.name) || ".jpg";
  const filename = `vendor-${vendorId}-${randomUUID().slice(0, 8)}${ext}`;
  const dir = join(process.cwd(), "public", "uploads", "vendors");
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(dir, filename), buffer);
  return `/uploads/vendors/${filename}`;
}

export async function createVendor(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "partners.write", "/admin/vendors");
  const name = str(formData, "name");
  if (!name) redirect("/admin/vendors?error=missing-name");
  const [created] = await db()
    .insert(schema.vendors)
    .values({
      name,
      company: str(formData, "company"),
      country: str(formData, "country"),
      email: str(formData, "email"),
      phone: str(formData, "phone"),
      contactName: str(formData, "contactName"),
      website: str(formData, "website"),
      notes: str(formData, "notes"),
    })
    .returning({ id: schema.vendors.id });

  const logoUrl = await handleLogoUpload(formData, created.id);
  if (logoUrl) await db().update(schema.vendors).set({ logoUrl }).where(eq(schema.vendors.id, created.id));

  await logAudit({ actorUserId: user.id, action: "VENDOR_CREATED", entity: "vendors", entityId: created.id, metadata: { name } });
  revalidatePath("/admin/vendors");
  revalidatePath("/vendors");
  redirect("/admin/vendors?created=1");
}

export async function updateVendor(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "partners.write", "/admin/vendors");
  const id = str(formData, "id");
  if (!id) redirect("/admin/vendors");

  const logoUrl = await handleLogoUpload(formData, id);

  await db()
    .update(schema.vendors)
    .set({
      name: str(formData, "name") ?? undefined,
      company: str(formData, "company"),
      country: str(formData, "country"),
      email: str(formData, "email"),
      phone: str(formData, "phone"),
      contactName: str(formData, "contactName"),
      website: str(formData, "website"),
      notes: str(formData, "notes"),
      logoUrl: logoUrl ?? undefined,
      status: (str(formData, "status") ?? "ACTIVE") as "ACTIVE",
      updatedAt: sql`now()`,
    })
    .where(eq(schema.vendors.id, id));
  await logAudit({ actorUserId: user.id, action: "VENDOR_UPDATED", entity: "vendors", entityId: id });
  revalidatePath("/admin/vendors");
  revalidatePath("/vendors");
  redirect("/admin/vendors?updated=1");
}

export async function deleteVendor(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "partners.manage", "/admin/vendors");
  const id = str(formData, "id");
  if (id) {
    await db().delete(schema.vendors).where(eq(schema.vendors.id, id));
    await logAudit({ actorUserId: user.id, action: "VENDOR_DELETED", entity: "vendors", entityId: id });
  }
  revalidatePath("/admin/vendors");
  revalidatePath("/vendors");
  redirect("/admin/vendors");
}
