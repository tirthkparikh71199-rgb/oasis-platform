"use server";

import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { requirePerm, requireUser } from "@/lib/auth";

export async function getUsageStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Service conversations (AI handling) - FREE UNLIMITED
  const serviceConversations = await db()
    .select({ count: sql<number>`count(distinct ${schema.conversations.externalId})::int` })
    .from(schema.conversations)
    .where(sql`${schema.conversations.createdAt} >= ${monthStart}`);

  // Marketing conversations (campaigns) - first 1,000 FREE
  const marketingConversations = await db()
    .select({ count: sql<number>`coalesce(sum(${schema.campaigns.sentCount}), 0)::int` })
    .from(schema.campaigns)
    .where(sql`${schema.campaigns.createdAt} >= ${monthStart} AND ${schema.campaigns.status} = 'SENT'`);

  // Total handoffs (AI → Admin)
  const handoffs = await db()
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.handoffs)
    .where(sql`${schema.handoffs.createdAt} >= ${monthStart}`);

  // Pending handoffs (need admin attention)
  const pendingHandoffs = await db()
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.handoffs)
    .where(sql`${schema.handoffs.status} IN ('NEW', 'QUEUED')`);

  // Marketing limit
  const marketingLimit = 1000;
  const marketingUsed = marketingConversations[0]?.count ?? 0;
  const marketingRemaining = Math.max(0, marketingLimit - marketingUsed);
  const marketingCost = marketingUsed > marketingLimit ? (marketingUsed - marketingLimit) * 0.73 : 0;

  return {
    service: {
      used: serviceConversations[0]?.count ?? 0,
      limit: "UNLIMITED",
      cost: 0,
      label: "AI conversations (service)",
    },
    marketing: {
      used: marketingUsed,
      limit: marketingLimit,
      remaining: marketingRemaining,
      cost: marketingCost,
      label: "Marketing campaigns",
    },
    handoffs: {
      total: handoffs[0]?.count ?? 0,
      pending: pendingHandoffs[0]?.count ?? 0,
      label: "AI → Admin handoffs",
    },
    totalCost: marketingCost,
    month: now.toLocaleString("en-IN", { month: "long", year: "numeric" }),
  };
}

export async function setConversationCap(formData: FormData) {
  const user = await requireUser();
  requirePerm(user, "settings.write", "/admin/usage");
  const cap = Number(formData.get("cap")) || 1000;
  
  await db()
    .insert(schema.settings)
    .values({ key: "whatsapp.marketingCap", value: cap })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value: cap } });

  revalidatePath("/admin/usage");
  redirect("/admin/usage?updated=1");
}
