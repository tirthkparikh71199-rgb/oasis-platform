import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@oasis/config";
import { createLogger } from "@oasis/logger";

const log = createLogger("mail");

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  cc?: string[];
  headers?: Record<string, string>;
}

export interface EmailProvider {
  readonly name: string;
  send(msg: EmailMessage): Promise<{ messageId: string }>;
  isConfigured(): boolean;
}

export class SmtpEmailProvider implements EmailProvider {
  readonly name = "smtp";
  private transporter: Transporter | null = null;

  constructor(private readonly cfg = env()) {}

  private getTransport(): Transporter | null {
    if (!this.cfg.SMTP_USER || !this.cfg.SMTP_PASS) return null;
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: this.cfg.SMTP_HOST,
        port: this.cfg.SMTP_PORT,
        secure: this.cfg.SMTP_PORT === 465,
        auth: { user: this.cfg.SMTP_USER, pass: this.cfg.SMTP_PASS },
        pool: true,
        maxMessages: 20,
      });
    }
    return this.transporter;
  }

  isConfigured(): boolean {
    return Boolean(this.cfg.SMTP_USER && this.cfg.SMTP_PASS);
  }

  async send(msg: EmailMessage): Promise<{ messageId: string }> {
    const t = this.getTransport();
    if (!t) throw new Error("SMTP not configured");
    const info = await t.sendMail({
      from: this.cfg.EMAIL_FROM,
      to: msg.to,
      cc: msg.cc,
      replyTo: msg.replyTo ?? this.cfg.EMAIL_REPLY_TO,
      subject: msg.subject,
      text: msg.text,
      html: msg.html,
      headers: msg.headers,
    });
    return { messageId: info.messageId };
  }
}

export class LogEmailProvider implements EmailProvider {
  readonly name = "log";

  isConfigured(): boolean {
    return true;
  }

  async send(msg: EmailMessage): Promise<{ messageId: string }> {
    log.info({ to: msg.to, subject: msg.subject }, `[email:log] ${msg.subject}`);
    return { messageId: `log-${Date.now()}` };
  }
}

export function createEmailProvider(): EmailProvider {
  const e = env();
  if (e.EMAIL_TRANSPORT === "smtp") return new SmtpEmailProvider(e);
  return new LogEmailProvider();
}
