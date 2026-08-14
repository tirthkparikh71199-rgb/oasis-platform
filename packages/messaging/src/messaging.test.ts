import { describe, it, expect, vi } from "vitest";
import { createEmailProvider } from "./email";
import { createWhatsAppProvider, SandboxWhatsAppProvider } from "./whatsapp";

describe("messaging providers", () => {
  it("uses log transport by default and always sends", async () => {
    const email = createEmailProvider();
    expect(email.name).toBe("log");
    expect(email.isConfigured()).toBe(true);
    const res = await email.send({ to: "x@test.in", subject: "hi", text: "body" });
    expect(res.messageId).toMatch(/^log-/);
  });

  it("sandbox WhatsApp always works without credentials", async () => {
    const wa = createWhatsAppProvider();
    expect(wa.name).toBe("sandbox");
    const res = await wa.send({ to: "+910000000000", text: "hello" });
    expect(res.messageId).toMatch(/^sandbox-/);
  });

  it("sandbox provider never calls the network", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response("{}", { status: 200 }));
    const wa = new SandboxWhatsAppProvider();
    await wa.send({ to: "x", text: "y" });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
