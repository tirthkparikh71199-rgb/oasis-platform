import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { schema } from "@oasis/db";
import { validateEmail } from "@oasis/messaging";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const name = String(form.get("name") ?? "").trim() || null;
  const phone = String(form.get("phone") ?? "").trim() || null;
  const source = String(form.get("source") ?? "NEWSLETTER").trim();

  if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });

  const validation = validateEmail(email);
  if (!validation.ok) {
    if (validation.reason === "disposable") return NextResponse.json({ error: "Please use your work email — temporary emails are not accepted." }, { status: 400 });
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  // Check blocklist
  const domain = email.split("@")[1];
  const blocked = await db().select({ id: schema.emailBlocks.id }).from(schema.emailBlocks).where(eq(schema.emailBlocks.value, email)).limit(1);
  const blockedDomain = await db().select({ id: schema.emailBlocks.id }).from(schema.emailBlocks).where(eq(schema.emailBlocks.value, domain)).limit(1);
  if (blocked.length > 0 || blockedDomain.length > 0) {
    return NextResponse.json({ error: "This email address is not eligible for our mailing list." }, { status: 400 });
  }

  // Upsert subscriber
  const existing = await db().select({ id: schema.subscribers.id, unsubscribed: schema.subscribers.unsubscribed }).from(schema.subscribers).where(eq(schema.subscribers.email, email)).limit(1);
  if (existing.length === 0) {
    await db().insert(schema.subscribers).values({ email, name, phone, source, unsubscribed: false });
    await logAudit({ actorType: "SYSTEM", action: "SUBSCRIBER_CREATED", entity: "subscribers", metadata: { email, source } });
  } else if (existing[0].unsubscribed) {
    await db().update(schema.subscribers).set({ unsubscribed: false, name: name ?? undefined, phone: phone ?? undefined }).where(eq(schema.subscribers.id, existing[0].id));
    await logAudit({ actorType: "SYSTEM", action: "SUBSCRIBER_RESUBSCRIBED", entity: "subscribers", metadata: { email } });
  }

  return NextResponse.json({ ok: true });
}
