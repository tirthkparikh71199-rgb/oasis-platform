import { NextRequest, NextResponse } from "next/server";
import { ilike } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const requests = await db()
    .select({
      id: schema.productRequests.id,
      productName: schema.productRequests.productName,
      gradeSpec: schema.productRequests.gradeSpec,
      quantity: schema.productRequests.quantity,
      unit: schema.productRequests.unit,
      status: schema.productRequests.status,
      createdAt: schema.productRequests.createdAt,
    })
    .from(schema.productRequests)
    .where(ilike(schema.productRequests.email, email))
    .orderBy(schema.productRequests.createdAt);

  return NextResponse.json({ requests });
}
