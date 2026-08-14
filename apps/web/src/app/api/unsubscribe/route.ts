import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { schema } from "@oasis/db";
import { verifyToken } from "@oasis/messaging";
import { env } from "@oasis/config";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const token = String(form.get("token") ?? "");
  const action = String(form.get("action") ?? "unsubscribe");

  if (!email || !token) return NextResponse.redirect(new URL("/unsubscribe?error=invalid", req.url));

  const secret = env().SESSION_SECRET;
  if (!verifyToken(email, token, secret)) {
    return NextResponse.redirect(new URL("/unsubscribe?error=invalid", req.url));
  }

  const existing = await db().select({ id: schema.subscribers.id, unsubscribed: schema.subscribers.unsubscribed }).from(schema.subscribers).where(eq(schema.subscribers.email, email)).limit(1);

  if (action === "resubscribe") {
    if (existing.length === 0) {
      await db().insert(schema.subscribers).values({ email, unsubscribed: false, source: "RESUBSCRIBE" });
    } else {
      await db().update(schema.subscribers).set({ unsubscribed: false }).where(eq(schema.subscribers.id, existing[0].id));
    }
    await logAudit({ actorType: "SYSTEM", action: "RESUBSCRIBED", entity: "subscribers", metadata: { email } });
    return NextResponse.redirect(new URL(`/unsubscribe?e=${encodeURIComponent(email)}&t=${token}&resubscribed=1`, req.url));
  }

  // unsubscribe
  if (existing.length === 0) {
    await db().insert(schema.subscribers).values({ email, unsubscribed: true, source: "UNSUBSCRIBE" });
  } else if (!existing[0].unsubscribed) {
    await db().update(schema.subscribers).set({ unsubscribed: true }).where(eq(schema.subscribers.id, existing[0].id));
  }
  await logAudit({ actorType: "SYSTEM", action: "UNSUBSCRIBED", entity: "subscribers", metadata: { email } });
  return NextResponse.redirect(new URL(`/unsubscribe?e=${encodeURIComponent(email)}&t=${token}&done=1`, req.url));
}
