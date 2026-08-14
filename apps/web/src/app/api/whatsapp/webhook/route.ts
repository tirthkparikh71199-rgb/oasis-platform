import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { schema } from "@oasis/db";
import { createWhatsAppProvider } from "@oasis/messaging";
import { runChatEngine } from "@/lib/chat-engine";
import { db } from "@/lib/db";
import { createLogger } from "@oasis/logger";

const log = createLogger("api-whatsapp");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface WaTextMessage {
  from: string;
  id: string;
  type: string;
  text?: { body?: string };
}

interface WaContact {
  profile?: { name?: string };
  wa_id?: string;
}

function hasValidSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) return true;
  if (!signatureHeader) return false;
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const received = signatureHeader.startsWith("sha256=") ? signatureHeader.slice(7) : signatureHeader;
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!hasValidSignature(raw, req.headers.get("x-hub-signature-256"))) {
    return new NextResponse("Bad signature", { status: 403 });
  }

  try {
    const payload = JSON.parse(raw) as {
      entry?: { changes?: { value?: { messages?: WaTextMessage[]; contacts?: WaContact[] } }[] }[];
    };
    const dbs = db();
    const whatsapp = createWhatsAppProvider();

    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        if (!value?.messages?.length) continue;
        const contactName = value.contacts?.[0]?.profile?.name;

        for (const msg of value.messages) {
          if (msg.type !== "text" || !msg.text?.body) continue;
          const phone = msg.from;
          const externalId = `wa:${phone}`;
          const text = msg.text.body.trim();
          if (!text) continue;

          try {
            if (contactName) {
              await dbs
                .update(schema.conversations)
                .set({ metadata: { phone, whatsappName: contactName } })
                .where(eq(schema.conversations.externalId, externalId));
            }

            const result = await runChatEngine({
              content: text,
              channel: "WHATSAPP",
              externalId,
              page: "whatsapp",
            });

            await whatsapp.send({ to: phone, text: result.reply });
            log.info({ phone, conversationId: result.conversationId }, "whatsapp reply sent");
          } catch (err) {
            log.error({ err, phone }, "whatsapp message processing failed");
            await whatsapp.send({
              to: phone,
              text: "Sorry, I hit a technical snag. Please try again shortly, or call our team directly — we're happy to help.",
            });
          }
        }
      }
    }
  } catch (err) {
    log.error({ err }, "whatsapp webhook parse failed");
  }

  return new NextResponse("OK", { status: 200 });
}
