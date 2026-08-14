import { requirePerm, requireUser } from "@/lib/auth";
import { getCompanyProfileSettings, getContactSettingsRaw, getSiteContent } from "@/lib/site-content";
import { db } from "@/lib/db";
import { schema } from "@oasis/db";
import { eq, sql } from "drizzle-orm";
import ContentEditor from "./content-editor";

export const metadata = { title: "Website Content | Oasis Impex Admin" };

export const dynamic = "force-dynamic";

export default async function AdminContentPage({ searchParams }: { searchParams: Promise<{ saved?: string; trained?: string }> }) {
  const user = await requireUser();
  requirePerm(user, "settings.read", "/admin");
  const { saved, trained } = await searchParams;

  const [content, profile, contact] = await Promise.all([getSiteContent(), getCompanyProfileSettings(), getContactSettingsRaw()]);

  const dbs = db();
  const [trainRow, docsCount] = await Promise.all([
    dbs
      .select({ value: schema.settings.value })
      .from(schema.settings)
      .where(eq(schema.settings.key, "system.agentTrained"))
      .limit(1),
    dbs.select({ n: sql<number>`count(*)::int` }).from(schema.knowledgeDocuments).where(eq(schema.knowledgeDocuments.visibility, "PUBLIC")),
  ]);
  const trainStatus = {
    trainedAt: (trainRow[0]?.value as { at?: string } | undefined)?.at ?? null,
    docs: docsCount[0]?.n ?? 0,
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Website Content</h1>
      </div>
      {saved ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Saved. The public website updates immediately.</p> : null}
      {trained ? <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Agent retrained with the latest Oasis Impex content.</p> : null}
      <p className="mt-1 text-sm text-slate-400">
        Every piece of text on the user-facing website is editable here. Changes go live as soon as you save.
      </p>
      <div className="mt-6">
        <ContentEditor content={content} profile={(profile ?? {}) as Record<string, unknown>} contact={(contact ?? {}) as Record<string, unknown>} trainStatus={trainStatus} />
      </div>
    </div>
  );
}
