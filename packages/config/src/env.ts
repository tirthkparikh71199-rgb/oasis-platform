import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  ADMIN_URL: z.string().url().default("http://localhost:3000/admin"),
  API_URL: z.string().url().default("http://localhost:3000/api"),
  SESSION_SECRET: z.string().min(16).default("dev-secret-change-me-please"),

  DATABASE_URL: z.string().default("postgresql://oasis:oasis@localhost:5432/oasis"),
  DATABASE_URL_READONLY: z.string().optional(),

  AI_PROVIDER: z.enum(["gemini", "mock"]).default("mock"),
  AI_MODEL: z.string().default("gemini-flash-latest"),
  GEMINI_API_KEY: z.string().default(""),
  EMBEDDING_MODEL: z.string().default("gemini-embedding-001"),
  EMBEDDING_DIM: z.coerce.number().int().positive().default(768),

  EMAIL_TRANSPORT: z.enum(["smtp", "log"]).default("log"),
  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.coerce.number().int().positive().default(465),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  EMAIL_FROM: z.string().default("Oasis Impex <no-reply@oasisimpex.in>"),
  EMAIL_REPLY_TO: z.string().default("info@oasisimpex.in"),
  EMAIL_INBOX_HOST: z.string().default(""),
  EMAIL_INBOX_PORT: z.coerce.number().int().positive().default(993),
  EMAIL_INBOX_USER: z.string().default(""),
  EMAIL_INBOX_PASS: z.string().default(""),
  ADMIN_ALERT_EMAIL: z.string().default("tirthkparikh71199@gmail.com"),
  DAILY_REPORT_HOUR: z.string().default("08:00"),
  DAILY_REPORT_TO: z.string().default(""),

  WHATSAPP_PROVIDER: z.enum(["sandbox", "meta"]).default("sandbox"),
  WHATSAPP_PHONE_NUMBER_ID: z.string().default(""),
  WHATSAPP_ACCESS_TOKEN: z.string().default(""),
  WHATSAPP_VERIFY_TOKEN: z.string().default(""),
  WHATSAPP_APP_SECRET: z.string().default(""),
  WHATSAPP_WEBHOOK_URL: z.string().default(""),
  TEAM_WHATSAPP_NUMBERS: z.string().default(""),

  BACKUP_ENCRYPTION_KEY: z.string().default(""),
  BACKUP_REMOTE: z.string().default(""),
  BACKUP_RETENTION_DAILY: z.coerce.number().int().default(14),
  BACKUP_RETENTION_WEEKLY: z.coerce.number().int().default(4),
  BACKUP_RETENTION_MONTHLY: z.coerce.number().int().default(3),

  DUCKDNS_TOKEN: z.string().default(""),
  DUCKDNS_SUBDOMAIN: z.string().default(""),
  DUCKDNS_HOST: z.string().default("duckdns.org"),

  SENTRY_DSN: z.string().default(""),
  GA_MEASUREMENT_ID: z.string().default(""),

  SEED_ADMIN_EMAIL: z.string().email().default("admin@oasisimpex.in"),
  SEED_ADMIN_PASSWORD: z.string().min(8).default("ChangeMe123!"),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return parsed.data;
}

let cached: Env | null = null;

export function env(): Env {
  if (!cached) cached = loadEnv();
  return cached;
}

export function resetEnv(): void {
  cached = null;
}
