import { env } from "@oasis/config";
import { createLogger } from "@oasis/logger";

const log = createLogger("whatsapp");

export interface WhatsAppMessage {
  to: string;
  text: string;
}

export interface WhatsAppProvider {
  readonly name: string;
  send(msg: WhatsAppMessage): Promise<{ messageId: string }>;
  isConfigured(): boolean;
}

const SANDBOX_MESSAGE = (text: string) => `[WhatsApp sandbox] Message queued: ${text}`;

export class SandboxWhatsAppProvider implements WhatsAppProvider {
  readonly name = "sandbox";

  isConfigured(): boolean {
    return true;
  }

  async send(msg: WhatsAppMessage): Promise<{ messageId: string }> {
    log.info({ to: msg.to }, SANDBOX_MESSAGE(msg.text));
    return { messageId: `sandbox-${Date.now()}` };
  }
}

export class MetaWhatsAppProvider implements WhatsAppProvider {
  readonly name = "meta";

  constructor(private readonly cfg = env()) {}

  isConfigured(): boolean {
    return Boolean(this.cfg.WHATSAPP_ACCESS_TOKEN && this.cfg.WHATSAPP_PHONE_NUMBER_ID);
  }

  async send(msg: WhatsAppMessage): Promise<{ messageId: string }> {
    if (!this.isConfigured()) throw new Error("Meta WhatsApp not configured");
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${this.cfg.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.cfg.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: msg.to,
          type: "text",
          text: { body: msg.text },
        }),
      },
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Meta WhatsApp failed (${res.status}): ${body.slice(0, 200)}`);
    }
    const data = (await res.json()) as { messages?: { id?: string }[] };
    return { messageId: data.messages?.[0]?.id ?? `wa-${Date.now()}` };
  }
}

export function createWhatsAppProvider(): WhatsAppProvider {
  const e = env();
  if (e.WHATSAPP_PROVIDER === "meta") return new MetaWhatsAppProvider(e);
  return new SandboxWhatsAppProvider();
}
