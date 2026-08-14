import { describe, it, expect } from "vitest";
import { loadEnv } from "./env";

describe("loadEnv", () => {
  it("applies defaults when empty", () => {
    const e = loadEnv({});
    expect(e.AI_PROVIDER).toBe("mock");
    expect(e.EMAIL_TRANSPORT).toBe("log");
    expect(e.WHATSAPP_PROVIDER).toBe("sandbox");
    expect(e.NODE_ENV).toBe("development");
  });

  it("reads provided values", () => {
    const e = loadEnv({ AI_PROVIDER: "gemini", AI_MODEL: "gemini-2.5-flash" });
    expect(e.AI_PROVIDER).toBe("gemini");
    expect(e.AI_MODEL).toBe("gemini-2.5-flash");
  });
});
