"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";
import { randomUUID } from "node:crypto";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { getSiteContent, upsertSiteContent } from "@/lib/site-content";

const str = (f: FormData, k: string) => (f.get(k) ? String(f.get(k)).trim() : null);

export async function saveContentArea(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "settings.write", "/admin/content");
  const area = str(formData, "area");
  const payload = str(formData, "payload");
  if (!area || !payload) redirect("/admin/content?error=bad-payload");

  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    redirect("/admin/content?error=bad-payload");
  }

  const current = await getSiteContent();
  (current as unknown as Record<string, unknown>)[area] = parsed;
  await upsertSiteContent(current);

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/admin/content");
  redirect("/admin/content?saved=1");
}

export async function saveCompanyProfile(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "settings.write", "/admin/content");

  const list = (k: string) =>
    str(formData, k)
      ?.split("\n")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];

  const profile = {
    name: str(formData, "name"),
    legalName: str(formData, "legalName"),
    established: Number(str(formData, "established") ?? 2010),
    employees: str(formData, "employees"),
    tagline: str(formData, "tagline"),
    businessType: str(formData, "businessType"),
    offices: [{ label: "Head Office", address: str(formData, "officeAddress") }],
    warehouse: str(formData, "warehouse"),
    phones: list("phones"),
    hours: str(formData, "hours"),
    leadTime: str(formData, "leadTime"),
    markets: list("markets"),
    aeo: str(formData, "aeo"),
    gstin: str(formData, "gstin"),
    lei: str(formData, "lei"),
    registration: {
      gstin: str(formData, "gstin"),
      lei: str(formData, "lei"),
      aeo: str(formData, "aeo"),
      partnershipFirm: true,
    },
  };

  const dbs = db();
  await dbs
    .insert(schema.settings)
    .values({ key: "company.profile", value: profile })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value: profile, updatedAt: new Date() } });

  const contact = {
    email: str(formData, "salesEmail"),
    phone: str(formData, "salesPhone"),
    whatsapp: str(formData, "salesWhatsapp"),
  };
  await dbs
    .insert(schema.settings)
    .values({ key: "contact.sales", value: contact })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value: contact, updatedAt: new Date() } });

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/admin/content");
  redirect("/admin/content?saved=1");
}

export async function uploadSiteMedia(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "settings.write", "/admin/content");
  const slot = str(formData, "slot");
  const file = formData.get("file");
  if (!slot || !(file instanceof File) || file.size === 0) redirect("/admin/content?error=no-file");

  const ext = extname(file.name) || ".png";
  const safe = [".png", ".jpg", ".jpeg", ".webp", ".avif", ".svg"].includes(ext.toLowerCase()) ? ext.toLowerCase() : ".png";
  const filename = `${randomUUID()}${safe}`;
  const dir = join(process.cwd(), "public", "uploads", "site");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), Buffer.from(await file.arrayBuffer()));
  const url = `/uploads/site/${filename}`;

  const current = await getSiteContent();
  current.media = { ...current.media, [slot]: url };
  await upsertSiteContent(current);

  revalidatePath("/");
  revalidatePath("/admin/content");
  redirect("/admin/content?saved=1");
}

export async function removeSiteMedia(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "settings.write", "/admin/content");
  const slot = str(formData, "slot");
  if (!slot) redirect("/admin/content");
  const current = await getSiteContent();
  if (current.media) {
    delete current.media[slot as keyof typeof current.media];
    await upsertSiteContent(current);
  }
  revalidatePath("/");
  revalidatePath("/admin/content");
  redirect("/admin/content?saved=1");
}

export async function resetSiteContent(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "settings.write", "/admin/content");
  const area = str(formData, "area");
  if (!area) redirect("/admin/content");
  const current = await getSiteContent();
  delete (current as unknown as Record<string, unknown>)[area];
  await upsertSiteContent(current);
  revalidatePath("/");
  revalidatePath("/admin/content");
  redirect("/admin/content?saved=1");
}
