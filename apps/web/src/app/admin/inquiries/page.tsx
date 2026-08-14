import { desc, eq } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { InquiryCard } from "./inquiry-card";

export const metadata = { title: "Inquiries | Oasis Impex Admin" };

export default async function AdminInquiriesPage() {
  const dbs = db();
  const inquiries = await dbs
    .select({
      id: schema.inquiries.id,
      name: schema.inquiries.name,
      company: schema.inquiries.company,
      email: schema.inquiries.email,
      phone: schema.inquiries.phone,
      quantityRequested: schema.inquiries.quantityRequested,
      message: schema.inquiries.message,
      source: schema.inquiries.source,
      status: schema.inquiries.status,
      product: schema.products.name,
      createdAt: schema.inquiries.createdAt,
    })
    .from(schema.inquiries)
    .leftJoin(schema.products, eq(schema.inquiries.productId, schema.products.id))
    .orderBy(desc(schema.inquiries.createdAt));

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Inquiries</h1>
      <p className="mt-1 text-sm text-slate-400">{inquiries.length} total. Change status to track the pipeline.</p>

      <div className="mt-6 space-y-3">
        {inquiries.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-slate-500">
            No inquiries yet. They'll appear here from the contact form, chat handoffs and WhatsApp.
          </p>
        ) : (
          inquiries.map((i) => <InquiryCard key={i.id} {...i} />)
        )}
      </div>
    </div>
  );
}
