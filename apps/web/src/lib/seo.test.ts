import { describe, it, expect } from "vitest";
import { buildMetadata } from "./seo";

describe("buildMetadata", () => {
  it("builds metadata with title template and canonical", () => {
    const md = buildMetadata({
      title: "PVC Resin K67",
      description: "Suspension PVC resin.",
      path: "/products/pvc-resin-k67",
    });
    expect(md.title).toEqual({
      default: "Oasis Impex — Importer of Polymer Raw Materials",
      template: "%s | Oasis Impex",
    });
    expect(md.description).toBe("Suspension PVC resin.");
    const canonical = typeof md.alternates === "object" && md.alternates?.canonical;
    expect(canonical).toContain("/products/pvc-resin-k67");
  });

  it("provides default keywords", () => {
    const md = buildMetadata({ title: "t", description: "d" });
    expect(md.keywords).toContain("PVC Resin");
  });
});
