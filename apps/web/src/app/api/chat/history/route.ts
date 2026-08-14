import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const conversationId = req.nextUrl.searchParams.get("conversationId");
  if (!conversationId) return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });

  const rows = await db()
    .select({
      senderType: schema.messages.senderType,
      content: schema.messages.content,
      createdAt: schema.messages.createdAt,
    })
    .from(schema.messages)
    .where(eq(schema.messages.conversationId, conversationId))
    .orderBy(asc(schema.messages.createdAt));

  return NextResponse.json({ messages: rows });
}
