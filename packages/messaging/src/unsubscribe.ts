import { createHmac, timingSafeEqual } from "node:crypto";

export function signToken(email: string, secret: string): string {
  return createHmac("sha256", secret).update(email.toLowerCase().trim()).digest("hex").slice(0, 32);
}

export function verifyToken(email: string, token: string, secret: string): boolean {
  const expected = signToken(email, secret);
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(token, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function unsubscribeUrl(appUrl: string, email: string, secret: string): string {
  const token = signToken(email, secret);
  const encoded = encodeURIComponent(email);
  return `${appUrl}/unsubscribe?e=${encoded}&t=${token}`;
}
