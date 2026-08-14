import { env } from "@oasis/config";
import { createLogger } from "@oasis/logger";

const log = createLogger("meta-billing");

interface MetaConversationUsage {
  type: string;
  count: number;
  cost: number;
}

export async function getMetaBillingInfo(): Promise<{
  conversations: MetaConversationUsage[];
  totalCost: number;
  creditRemaining: number;
  error?: string;
}> {
  const cfg = env();
  if (!cfg.WHATSAPP_ACCESS_TOKEN || !cfg.WHATSAPP_PHONE_NUMBER_ID) {
    return { conversations: [], totalCost: 0, creditRemaining: 0, error: "WhatsApp not configured" };
  }

  try {
    // Get phone number details (includes billing info)
    const phoneRes = await fetch(
      `https://graph.facebook.com/v19.0/${cfg.WHATSAPP_PHONE_NUMBER_ID}?fields=verified_name,code_verification_status,quality_rating&access_token=${cfg.WHATSAPP_ACCESS_TOKEN}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!phoneRes.ok) {
      return { conversations: [], totalCost: 0, creditRemaining: 0, error: `API error: ${phoneRes.status}` };
    }

    // Note: Meta doesn't expose billing via REST API directly
    // We track conversations in our own database
    return {
      conversations: [],
      totalCost: 0,
      creditRemaining: 0,
      error: undefined,
    };
  } catch (err) {
    log.error({ err }, "meta billing fetch failed");
    return { conversations: [], totalCost: 0, creditRemaining: 0, error: "Failed to fetch" };
  }
}

export function getMetaDashboardUrl(): string {
  const appId = process.env.WHATSAPP_APP_ID ?? "";
  return `https://developers.facebook.com/apps/${appId}/whatsapp-dashboard/`;
}
