import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { schema } from "@oasis/db";
import { contactFormSchema } from "@oasis/domain";
import { db } from "@/lib/db";
import { notifyTeam } from "@/lib/notify";
import { createEmailProvider } from "@oasis/messaging";
import { env } from "@oasis/config";
import { createLogger } from "@oasis/logger";

const log = createLogger("api-inquiries");

const INQUIRY_EMAIL_TEMPLATE = (d: { name: string; company?: string; email?: string; whatsapp?: string; phone: string; product?: string; quantity?: string; message: string }) => `
New inquiry via oasisimpex website
-----------------------------------
Name:       ${d.name}
Company:    ${d.company || "—"}
Phone:      ${d.phone}
WhatsApp:   ${d.whatsapp || "—"}
Email:      ${d.email || "—"}
Product:    ${d.product || "—"}
Quantity:   ${d.quantity || "—"}

Message:
${d.message}
`;

const AUTO_REPLY = (name: string) => `
Dear ${name},

Thank you for your inquiry to Oasis Impex. Our sales team has received your requirement and will get back to you shortly with details.

For urgent requirements, please call us at +91 98251 41637 (Mon–Sat, 10:30–18:00 IST).

Regards,
Oasis Impex
1112, Fortune Business Hub, Science City Road, Ahmedabad, Gujarat 380060
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = contactFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid inquiry" }, { status: 400 });
    }
    const d = parsed.data;

    const dbs = db();
    const product = d.productId
      ? await dbs.select({ name: schema.products.name }).from(schema.products).where(eq(schema.products.id, d.productId)).limit(1)
      : [];

    const [inquiry] = await dbs
      .insert(schema.inquiries)
      .values({
        name: d.name,
        company: d.company || null,
        email: d.email || null,
        phone: d.phone,
        whatsapp: d.whatsapp || null,
        productId: d.productId || null,
        quantityRequested: d.quantityRequested || null,
        message: d.message,
        source: "WEB",
        status: "NEW",
      })
      .returning();

    await dbs.insert(schema.auditLogs).values({
      actorType: "SYSTEM",
      action: "INQUIRY_CREATED",
      entity: "inquiries",
      entityId: inquiry.id,
      metadata: { source: "web", product: product[0]?.name ?? null },
    });

    const email = createEmailProvider();
    const adminSent = email.isConfigured()
      ? await email.send({
          to: "sales@oasisimpex.in",
          subject: `New inquiry — ${d.name}${d.company ? ` (${d.company})` : ""}`,
          text: INQUIRY_EMAIL_TEMPLATE({ ...d, product: product[0]?.name }),
        })
      : null;

    await notifyTeam("New lead inquiry", [
      { label: "Name", value: d.name },
      { label: "Company", value: d.company },
      { label: "Phone", value: d.phone },
      { label: "Email", value: d.email },
      { label: "Product", value: product[0]?.name },
      { label: "Message", value: d.message },
    ], `Open: ${env().APP_URL ?? "http://localhost:3000"}/admin/inquiries`);

    let autoReplySent = false;
    if (d.email && email.isConfigured()) {
      try {
        await email.send({ to: d.email, subject: "Thank you — Oasis Impex", text: AUTO_REPLY(d.name) });
        autoReplySent = true;
      } catch (err) {
        log.warn({ err }, "auto-reply failed");
      }
    }

    return NextResponse.json({
      ok: true,
      id: inquiry.id,
      adminNotified: Boolean(adminSent),
      autoReplySent,
    });
  } catch (err) {
    log.error({ err }, "inquiry failed");
    return NextResponse.json({ error: "Could not submit inquiry. Please call us directly." }, { status: 500 });
  }
}
