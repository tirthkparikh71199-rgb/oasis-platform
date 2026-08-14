import { NextRequest, NextResponse } from "next/server";
import { runChatEngine } from "@/lib/chat-engine";
import { createEmailProvider } from "@oasis/messaging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { from, subject, text, messageId } = body;

  if (!from || !text) {
    return NextResponse.json({ error: "from and text are required" }, { status: 400 });
  }

  try {
    // Run through chat engine
    const result = await runChatEngine({
      content: `[Email from ${from}]\nSubject: ${subject}\n\n${text}`,
      channel: "EMAIL",
      externalId: `email:${from.toLowerCase()}`,
      page: "email",
    });

    // Send reply via email
    const email = createEmailProvider();
    if (email.isConfigured()) {
      const replySubject = subject?.startsWith("Re:") ? subject : `Re: ${subject || "(no subject)"}`;
      await email.send({
        to: from,
        subject: replySubject,
        text: result.reply,
        headers: messageId ? {
          "In-Reply-To": messageId,
          "References": messageId,
        } : undefined,
      });
    }

    return NextResponse.json({ ok: true, conversationId: result.conversationId });
  } catch (err) {
    console.error("Email processing failed:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
