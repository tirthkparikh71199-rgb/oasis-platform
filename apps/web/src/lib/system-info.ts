import { env } from "@oasis/config";

export interface SystemInfo {
  domain: string;
  appUrl: string;
  environment: string;
  nodeVersion: string;
  uptime: number;
  memory: { total: number; used: number; free: number };
  aiProvider: string;
  aiModel: string;
  emailTransport: string;
  whatsappProvider: string;
  databaseUrl: string;
}

export function getSystemInfo(): SystemInfo {
  const cfg = env();
  const mem = process.memoryUsage();

  return {
    domain: cfg.APP_URL.replace("https://", "").replace("http://", ""),
    appUrl: cfg.APP_URL,
    environment: cfg.NODE_ENV,
    nodeVersion: process.version,
    uptime: process.uptime(),
    memory: {
      total: Math.round(mem.heapTotal / 1024 / 1024),
      used: Math.round(mem.heapUsed / 1024 / 1024),
      free: Math.round((mem.heapTotal - mem.heapUsed) / 1024 / 1024),
    },
    aiProvider: cfg.AI_PROVIDER,
    aiModel: cfg.AI_MODEL,
    emailTransport: cfg.EMAIL_TRANSPORT,
    whatsappProvider: cfg.WHATSAPP_PROVIDER,
    databaseUrl: cfg.DATABASE_URL.replace(/\/\/.*@/, "//***@"),
  };
}
