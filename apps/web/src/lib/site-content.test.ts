import { describe, it, expect } from "vitest";
import { DEFAULT_SITE_CONTENT, deepMerge, type SiteContent } from "./site-content";

describe("DEFAULT_SITE_CONTENT", () => {
  it("contains every public-facing area", () => {
    const c: SiteContent = DEFAULT_SITE_CONTENT;
    expect(c.home.hero.headline1).toBe("PVC raw materials,");
    expect(c.home.hero.headline2).toBe("delivered with certainty.");
    expect(c.home.hero.ctaPrimary).toBe("Explore products");
    expect(c.home.hero.ctaSecondary).toBe("Request a quotation");
    expect(c.home.stats.length).toBeGreaterThanOrEqual(4);
    expect(c.home.marquee).toContain("PVC RESIN");
    expect(c.home.productSection.title).toBe("What we supply");
    expect(c.home.cta.callLabel).toContain("{phone}");
    expect(c.about.whoWeAre.paragraphs.length).toBeGreaterThan(0);
    expect(c.about.registrations.cards.map((r) => r.label)).toContain("GSTIN");
    expect(c.about.team.members.length).toBeGreaterThanOrEqual(3);
    expect(c.contactPage.hero.title).toBe("Talk to our sales team");
    expect(c.footer.description).toContain("pipe, profile and fittings");
    expect(c.chat.assistantName).toBe("Oasis Impex assistant");
    expect(c.chat.quickPrompts.length).toBeGreaterThanOrEqual(4);
    expect(c.productsPage.title).toBe("Our products");
  });
});

describe("deepMerge", () => {
  const base = {
    a: "one",
    b: { x: 1, y: 2 },
    arr: ["p", "q"],
  };

  it("overrides scalars and merges nested objects", () => {
    const out = deepMerge(base, { a: "two", b: { y: 9 } });
    expect(out.a).toBe("two");
    expect(out.b).toEqual({ x: 1, y: 9 });
  });

  it("replaces arrays wholesale when override is non-empty", () => {
    const out = deepMerge(base, { arr: ["r"] });
    expect(out.arr).toEqual(["r"]);
  });

  it("ignores empty/undefined overrides and keeps base", () => {
    const out = deepMerge(base, { a: "", b: null, arr: [] });
    expect(out.a).toBe("one");
    expect(out.b).toEqual({ x: 1, y: 2 });
    expect(out.arr).toEqual(["p", "q"]);
  });
});
