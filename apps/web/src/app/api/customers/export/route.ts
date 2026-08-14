import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { getSessionUser, hasPermission } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function esc(v: unknown): string {
  const s = v == null ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  const user = await getSessionUser();
  if (!user || !hasPermission(user, "partners.read")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const rows = await db().select().from(schema.customers).orderBy(desc(schema.customers.createdAt));
  const header = ["name", "company", "email", "phone", "whatsapp", "location", "industry", "status", "notes", "created_at"];
  const lines = rows.map((c) => [c.name, c.company, c.email, c.phone, c.whatsapp, c.location, c.industry, c.status, c.notes, c.createdAt.toISOString()].map(esc).join(","));
  const csv = [header.join(","), ...lines].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="oasis-customers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
