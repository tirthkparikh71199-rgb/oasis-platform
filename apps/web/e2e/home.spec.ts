import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("renders hero, key CTAs and sections", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Oasis Impex/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("PVC raw materials");
    await expect(page.getByRole("link", { name: /Explore products/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Request a quotation/i }).first()).toBeVisible();
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/");
    const links = ["Products", "About", "Contact"];
    for (const label of links) {
      await page.getByRole("link", { name: label, exact: true }).first().click();
      await expect(page).not.toHaveURL("/");
      await page.goto("/");
    }
  });

  test("product cards link to product pages", async ({ page }) => {
    await page.goto("/products");
    const card = page.locator("a.card").first();
    await expect(card).toBeVisible();
    await card.click();
    await expect(page).toHaveURL(/\/products\//);
  });
});
