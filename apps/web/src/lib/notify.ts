import "server-only";
import { createEmailProvider } from "@oasis/messaging";
import { createWhatsAppProvider } from "@oasis/messaging";
import { env } from "@oasis/config";
import { createLogger } from "@oasis/logger";

const log = createLogger("notify");

export async function notifyTeam(event: string, lines: Array<{ label: string; value?: string | null }>, extra?: string): Promise<void> {
  try {
    const cfg = env();
    
    // Email notification
    const to = cfg.ADMIN_ALERT_EMAIL;
    if (to) {
      const email = createEmailProvider();
      if (email.isConfigured()) {
        const body = [
          event,
          "-----------------------------------",
          ...lines.filter((l) => l.value).map((l) => `${l.label}: ${l.value}`),
          extra ?? "",
        ].join("\n");
        await email.send({ to, subject: `[Oasis Impex] ${event}`, text: body });
      }
    }

    // WhatsApp notification to team numbers
    const teamNumbers = cfg.TEAM_WHATSAPP_NUMBERS?.split(",").map(n => n.trim()).filter(Boolean);
    if (teamNumbers?.length) {
      const whatsapp = createWhatsAppProvider();
      if (whatsapp.isConfigured()) {
        const body = [
          `📢 ${event}`,
          "",
          ...lines.filter((l) => l.value).map((l) => `${l.label}: ${l.value}`),
          extra ?? "",
        ].join("\n");
        
        for (const number of teamNumbers) {
          try {
            await whatsapp.send({ to: number, text: body });
          } catch (err) {
            log.warn({ err, number }, "team WhatsApp notification failed");
          }
        }
      }
    }
  } catch (err) {
    log.warn({ err }, "team notification failed");
  }
}
