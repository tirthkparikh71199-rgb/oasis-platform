import { NextResponse } from "next/server";
import { desc, sql } from "drizzle-orm";
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
  if (!user || !hasPermission(user, "settings.read")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const rows = await db()
    .select({
      createdAt: schema.auditLogs.createdAt,
      action: schema.auditLogs.action,
      actorType: schema.auditLogs.actorType,
      entity: schema.auditLogs.entity,
      entityId: schema.auditLogs.entityId,
      metadata: schema.auditLogs.metadata,
    })
    .from(schema.auditLogs)
    .where(sql`${schema.auditLogs.createdAt} >= now() - interval '90 days'`)
    .orderBy(desc(schema.auditLogs.createdAt));

  const header = "time,actor_type,action,entity,entity_id,metadata";
  const lines = rows.map((r) =>
    [r.createdAt.toISOString(), r.actorType, r.action, r.entity ?? "", r.entityId ?? "", JSON.stringify(r.metadata ?? {})].map(esc).join(","),
  );
  const csv = [header, ...lines].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="oasis-audit-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
