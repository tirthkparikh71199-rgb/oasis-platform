import { test, expect } from "@playwright/test";

test.describe("Mobile & tablet responsiveness", () => {
  test("mobile: menu opens and closes", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "Only meaningful on a mobile viewport");
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: /Open menu/i });
    await expect(menuButton).toBeVisible();
    await menuButton.tap();
    await expect(page.getByRole("link", { name: "Products", exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Products", exact: true }).tap();
    await expect(page).toHaveURL(/\/products/);
  });

  test("mobile: no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("tablet: chat widget opens and sends a message", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Open chat assistant/i }).click();
    const dialog = page.getByRole("dialog", { name: /Oasis Impex assistant/i });
    await expect(dialog).toBeVisible();
    await dialog.getByPlaceholder(/Ask about products/i).fill("Do you supply PVC resin?");
    await dialog.getByRole("button", { name: /Send message/i }).click();
    await expect(dialog.getByText(/PVC|sales|products/i).first()).toBeVisible({ timeout: 15_000 });
  });
});
