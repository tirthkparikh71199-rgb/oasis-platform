import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { createLogger } from "@oasis/logger";
import { env } from "@oasis/config";

const log = createLogger("email-channel");

interface EmailMessage {
  from: string;
  subject: string;
  text: string;
  messageId?: string;
  inReplyTo?: string;
  references?: string[];
}

export async function pollInbox(): Promise<number> {
  const cfg = env();
  if (!cfg.EMAIL_INBOX_HOST || !cfg.EMAIL_INBOX_USER || !cfg.EMAIL_INBOX_PASS) {
    return 0; // IMAP not configured
  }

  let client: ImapFlow | null = null;
  let processed = 0;

  try {
    client = new ImapFlow({
      host: cfg.EMAIL_INBOX_HOST,
      port: cfg.EMAIL_INBOX_PORT,
      secure: cfg.EMAIL_INBOX_PORT === 993,
      auth: {
        user: cfg.EMAIL_INBOX_USER,
        pass: cfg.EMAIL_INBOX_PASS,
      },
      logger: false,
    });

    await client.connect();

    // Check for new messages in INBOX
    const lock = await client.getMailboxLock("INBOX");
    try {
      // Search for unseen messages (using type assertion for IMAP search criteria)
      const searchResult = await client.search({ unseen: true } as any, { uid: true });
      if (!searchResult || searchResult.length === 0) {
        lock.release();
        await client.logout();
        return 0;
      }

      // Fetch messages
      for (const uid of searchResult) {
        try {
          const msg = await client.fetch(uid, { source: true, uid: true });
          
          // Process the message
          for await (const message of msg) {
            if (!message.source) continue;

            // Parse the email
            const parsed = await simpleParser(message.source);

            if (!parsed.from?.text || !parsed.text) continue;

            const fromAddress = parsed.from.value[0]?.address;
            if (!fromAddress) continue;

            // Skip emails from ourselves (avoid loops)
            if (fromAddress === cfg.EMAIL_FROM || fromAddress === cfg.EMAIL_REPLY_TO) {
              continue;
            }

            const emailMsg: EmailMessage = {
              from: fromAddress,
              subject: parsed.subject || "(no subject)",
              text: parsed.text,
              messageId: parsed.messageId,
              inReplyTo: parsed.inReplyTo || undefined,
              references: Array.isArray(parsed.references) ? parsed.references : [],
            };

            // Process through chat engine via API
            await processEmail(emailMsg);
            processed++;

            // Mark as seen
            await client.messageFlagsAdd(uid, ["\\Seen"]);
          }
        } catch (err) {
          log.error({ err, uid }, "failed to process email");
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();
  } catch (err) {
    log.error({ err }, "IMAP poll failed");
    if (client) {
      try { await client.logout(); } catch { /* ignore */ }
    }
  }

  return processed;
}

async function processEmail(msg: EmailMessage): Promise<void> {
  try {
    const appUrl = env().APP_URL;
    
    // Call the web app's email processing endpoint
    const response = await fetch(`${appUrl}/api/email/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: msg.from,
        subject: msg.subject,
        text: msg.text,
        messageId: msg.messageId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Email processing API returned ${response.status}`);
    }

    log.info({ from: msg.from }, "email processed via API");
  } catch (err) {
    log.error({ err, from: msg.from }, "email processing failed");

    // Send fallback reply
    try {
      const { createEmailProvider } = await import("@oasis/messaging");
      const email = createEmailProvider();
      if (email.isConfigured()) {
        await email.send({
          to: msg.from,
          subject: `Re: ${msg.subject}`,
          text: `Thank you for your email. Our team has received your message and will get back to you shortly.\n\nFor urgent requirements, please call us at +91 98251 41637 (Mon-Sat, 10:30-18:00 IST).\n\nRegards,\nOasis Impex`,
        });
      }
    } catch (replyErr) {
      log.error({ err: replyErr }, "fallback email reply failed");
    }
  }
}
