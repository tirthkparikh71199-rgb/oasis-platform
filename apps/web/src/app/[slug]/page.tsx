import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DynamicPageSlug({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [page] = await db().select().from(schema.dynamicPages).where(eq(schema.dynamicPages.slug, slug)).limit(1);
  if (!page || !page.isPublished) notFound();

  const content = (page.content as { blocks?: Array<{ type: string; content: string; style?: string }> }) ?? {};
  const blocks = content.blocks ?? [];

  return (
    <>
      <section className="relative overflow-hidden bg-ink pt-32 pb-16 text-white">
        <div className="grid-bg pointer-events-none absolute inset-0" />
        <div className="container-x relative">
          <p className="eyebrow text-accent">Page</p>
          <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">{page.title}</h1>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-x max-w-4xl">
          {blocks.length === 0 ? (
            <p className="text-ink/60">This page has no content yet.</p>
          ) : (
            <div className="prose prose-lg max-w-none">
              {blocks.map((block, i) => {
                if (block.type === "heading") return <h2 key={i} className="text-2xl font-bold text-ink mt-8 mb-4">{block.content}</h2>;
                if (block.type === "paragraph") return <p key={i} className="text-ink/70 leading-relaxed mb-4">{block.content}</p>;
                if (block.type === "list") return <ul key={i} className="list-disc pl-6 space-y-2 text-ink/70 mb-4">{block.content.split("\n").map((item, j) => <li key={j}>{item}</li>)}</ul>;
                if (block.type === "quote") return <blockquote key={i} className="border-l-4 border-brand pl-4 italic text-ink/60 my-6">{block.content}</blockquote>;
                return <p key={i} className="text-ink/70 mb-4">{block.content}</p>;
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
