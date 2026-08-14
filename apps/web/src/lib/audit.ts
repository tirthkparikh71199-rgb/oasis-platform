import "server-only";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";

interface LogAuditInput {
  actorUserId?: string | null;
  actorType?: "USER" | "SYSTEM";
  action: string;
  entity?: string;
  entityId?: string;
  ip?: string | null;
  metadata?: Record<string, unknown>;
}

export async function logAudit(input: LogAuditInput) {
  try {
    await db().insert(schema.auditLogs).values({
      actorUserId: input.actorUserId ?? null,
      actorType: input.actorType ?? "USER",
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      ip: input.ip ?? null,
      metadata: input.metadata ?? {},
    });
  } catch (err) {
    console.warn("audit log insert failed", err);
  }
}
