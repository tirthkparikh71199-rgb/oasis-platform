"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const str = (f: FormData, k: string) => (f.get(k) ? String(f.get(k)).trim() : null);

export async function addBlock(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "campaigns.write", "/admin/email-controls");
  const kind = str(formData, "kind") as "EMAIL" | "DOMAIN";
  const value = str(formData, "value")?.toLowerCase().trim();
  const reason = str(formData, "reason");

  if (!kind || !value) redirect("/admin/email-controls");
  if (!["EMAIL", "DOMAIN"].includes(kind)) redirect("/admin/email-controls");

  await db().insert(schema.emailBlocks).values({ kind, value, reason: reason ?? "Admin blocked", createdBy: user.id });
  await logAudit({ actorUserId: user.id, action: "EMAIL_BLOCKED", entity: "email_blocks", metadata: { kind, value } });
  revalidatePath("/admin/email-controls");
  redirect("/admin/email-controls");
}

export async function removeBlock(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "campaigns.write", "/admin/email-controls");
  const id = str(formData, "id");
  if (id) {
    await db().delete(schema.emailBlocks).where(eq(schema.emailBlocks.id, id));
    await logAudit({ actorUserId: user.id, action: "EMAIL_UNBLOCKED", entity: "email_blocks", entityId: id });
  }
  revalidatePath("/admin/email-controls");
  redirect("/admin/email-controls");
}
