import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
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
  if (!user || !hasPermission(user, "leads.read")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const rows = await db()
    .select({
      name: schema.inquiries.name,
      company: schema.inquiries.company,
      email: schema.inquiries.email,
      phone: schema.inquiries.phone,
      whatsapp: schema.inquiries.whatsapp,
      product: schema.products.name,
      quantityRequested: schema.inquiries.quantityRequested,
      message: schema.inquiries.message,
      source: schema.inquiries.source,
      status: schema.inquiries.status,
      createdAt: schema.inquiries.createdAt,
    })
    .from(schema.inquiries)
    .leftJoin(schema.products, eq(schema.inquiries.productId, schema.products.id))
    .orderBy(desc(schema.inquiries.createdAt));

  const header = ["name", "company", "email", "phone", "whatsapp", "product", "quantity_requested", "message", "source", "status", "created_at"];
  const lines = rows.map((r) =>
    [r.name, r.company, r.email, r.phone, r.whatsapp, r.product, r.quantityRequested, r.message, r.source, r.status, r.createdAt.toISOString()].map(esc).join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="oasis-inquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
