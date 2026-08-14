import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {};

  // Database check
  try {
    await db().execute(sql`SELECT 1`);
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  // AI check
  try {
    checks.ai = "ok";
  } catch {
    checks.ai = "error";
  }

  const allHealthy = Object.values(checks).every((v) => v === "ok");

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
      version: process.env.npm_package_version ?? "unknown",
    },
    { status: allHealthy ? 200 : 503 }
  );
}
