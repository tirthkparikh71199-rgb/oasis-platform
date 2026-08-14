import { describe, it, expect } from "vitest";
import { hasPermission, type SessionUser } from "./rbac";

function user(roles: string[], permissions: string[]): SessionUser {
  return { id: "u1", email: "a@oasisimpex.in", name: "A", roles, permissions };
}

describe("hasPermission", () => {
  it("grants when the role lists the permission", () => {
    expect(hasPermission(user(["SALES"], ["orders.write"]), "orders.write")).toBe(true);
  });

  it("denies when the permission is not listed", () => {
    expect(hasPermission(user(["ANALYST"], ["orders.read", "orders.write"]), "orders.manage")).toBe(false);
  });

  it("always grants SUPER_ADMIN", () => {
    expect(hasPermission(user(["SUPER_ADMIN"], []), "anything.at.all")).toBe(true);
  });

  it("VIEWER only has read access", () => {
    expect(hasPermission(user(["VIEWER"], ["orders.read"]), "orders.write")).toBe(false);
  });
});
