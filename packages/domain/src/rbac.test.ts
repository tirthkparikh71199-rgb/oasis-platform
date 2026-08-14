import { describe, it, expect } from "vitest";
import { ROLE, PERMISSION, can, canAny, rolesFor, ROLE_LABEL } from "./rbac";

describe("RBAC", () => {
  it("super admin can do everything", () => {
    expect(can(ROLE.SUPER_ADMIN, PERMISSION.ROLES_MANAGE)).toBe(true);
    expect(can(ROLE.SUPER_ADMIN, PERMISSION.SYSTEM_MONITOR)).toBe(true);
  });

  it("viewer cannot write", () => {
    expect(can(ROLE.VIEWER, PERMISSION.LEADS_WRITE)).toBe(false);
    expect(can(ROLE.VIEWER, PERMISSION.CATALOG_WRITE)).toBe(false);
  });

  it("sales can handle leads and chat but not inventory writes", () => {
    expect(can(ROLE.SALES, PERMISSION.LEADS_WRITE)).toBe(true);
    expect(can(ROLE.SALES, PERMISSION.CHAT_REPLY)).toBe(true);
    expect(can(ROLE.SALES, PERMISSION.INVENTORY_WRITE)).toBe(false);
  });

  it("rolesFor inventory.manage returns inventory manager and admin", () => {
    const roles = rolesFor(PERMISSION.INVENTORY_MANAGE);
    expect(roles).toContain(ROLE.INVENTORY_MANAGER);
    expect(roles).toContain(ROLE.ADMIN);
    expect(roles).not.toContain(ROLE.VIEWER);
  });

  it("canAny works", () => {
    expect(canAny(ROLE.AGENT, [PERMISSION.LEADS_WRITE, PERMISSION.CHAT_REPLY])).toBe(true);
    expect(canAny(ROLE.VIEWER, [PERMISSION.CHAT_REPLY, PERMISSION.LEADS_WRITE])).toBe(false);
  });

  it("has labels for every role", () => {
    for (const role of Object.values(ROLE)) {
      expect(ROLE_LABEL[role].length).toBeGreaterThan(0);
    }
  });
});
