import { NextResponse } from "next/server";
import { checkMarketingUsageAndAlert } from "@/lib/billing-alert";
import { createLogger } from "@oasis/logger";

const log = createLogger("billing-alert-route");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Triggered by the worker/cron to check WhatsApp marketing usage and email
// alerts at 80/95/100% thresholds.
export async function POST(): Promise<NextResponse> {
  try {
    await checkMarketingUsageAndAlert();
    return NextResponse.json({ ok: true });
  } catch (err) {
    log.error({ err }, "billing alert check failed");
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
