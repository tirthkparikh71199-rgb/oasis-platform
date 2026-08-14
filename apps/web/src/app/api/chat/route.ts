import { NextRequest, NextResponse } from "next/server";
import { chatMessageSchema } from "@oasis/domain";
import { runChatEngine } from "@/lib/chat-engine";
import { createLogger } from "@oasis/logger";

const log = createLogger("api-chat");

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = chatMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
    }
    const { content, conversationId } = parsed.data;

    const result = await runChatEngine({
      content,
      conversationId,
      channel: "WEB",
      page: req.headers.get("referer") ?? "",
    });

    return NextResponse.json(result);
  } catch (err) {
    log.error({ err }, "chat failed");
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
