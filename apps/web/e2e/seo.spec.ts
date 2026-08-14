import { test, expect } from "@playwright/test";

test.describe("Contact & SEO", () => {
  test("contact page has form and company details", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByLabel(/Full name/i)).toBeVisible();
    await expect(page.getByLabel(/Phone/i)).toBeVisible();
    await expect(page.getByText(/Ahmedabad/i).first()).toBeVisible();
  });

  test("robots.txt and sitemap are served", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBeTruthy();
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
  });
});
