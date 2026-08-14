import "server-only";
import type { TrainingDoc } from "@oasis/rag";
import { getCompanyProfile, getProducts, getContactSettings } from "@/lib/content";
import { getSiteContent } from "@/lib/site-content";

export async function buildTrainingCorpus(): Promise<TrainingDoc[]> {
  const [profile, contact, site] = await Promise.all([getCompanyProfile(), getContactSettings(), getSiteContent()]);
  const products = await getProducts({ publicOnly: false });
  const offices = profile.offices?.[0]?.address ?? "";
  const markets = (profile.markets ?? ["Southeast Asia"]).join(", ");
  const phones = profile.phones ?? [];

  const docs: TrainingDoc[] = [];

  docs.push({
    title: "About Oasis Impex",
    filename: "about-oasis-impex.md",
    source: "live",
    documentType: "COMPANY",
    visibility: "PUBLIC",
    content: [
      `${profile.name} is a partnership firm based in Ahmedabad, Gujarat, established in ${profile.established ?? 2010}, importing and supplying polymer raw materials.`,
      site.about.whoWeAre.paragraphs.join(" "),
      `Registered office: ${offices}.`,
      `Team: ${site.about.team.members.map((m) => `${m.name} (${m.role})`).join("; ")}.`,
    ].join("\n"),
  });

  docs.push({
    title: "Company profile & registrations",
    filename: "company-profile.md",
    source: "live",
    documentType: "COMPANY",
    visibility: "PUBLIC",
    content: [
      `${profile.name} (${profile.legalName ?? ""}). Business type: ${profile.businessType ?? "Trading company — Importer/Exporter"}. Tagline: ${profile.tagline}.`,
      `GSTIN ${profile.gstin ?? ""}; LEI ${profile.lei ?? ""}; AEO ${profile.aeo ?? ""}.`,
      `Head office: ${offices}. Warehouse: ${profile.warehouse ?? ""}.`,
      `Approx ${profile.employees ?? 10} people; lead time ~${profile.leadTime ?? 15} days.`,
    ].join("\n"),
  });

  docs.push({
    title: "Contact & business hours",
    filename: "contact-business-hours.md",
    source: "live",
    documentType: "COMPANY",
    visibility: "PUBLIC",
    content: [
      `Phone: ${phones.join(", ")}.`,
      `Email: ${contact.email ?? "info@oasisimpex.in"}.`,
      `Business hours: ${profile.hours ?? ""}.`,
      `Registered office: ${offices}.`,
    ].join("\n"),
  });

  const productLines = products
    .map(
      (p) =>
        `${p.name} (${p.sku}). ${p.shortDescription} ${p.description} Specifications: ${Object.entries(p.specifications ?? {})
          .map(([k, v]) => `${k} ${v}`)
          .join("; ")}. Applications: ${(p.applications ?? []).join(", ")}. Industries: ${(p.industries ?? []).join(", ")}. Origin: ${p.origin ?? ""}. Packaging: ${p.packaging ?? ""}. Unit: ${p.unit ?? "MT"}. MOQ: ${p.moq ?? "As negotiated"}.`,
    )
    .join("\n");

  docs.push({
    title: "Our Product Range Overview",
    filename: "product-range-overview.md",
    source: "live",
    documentType: "BROCHURE",
    visibility: "PUBLIC",
    content: productLines || "We supply PVC Resin (K67, K57), PET Resin (bottle grade IV 0.80), PVC Regrind and Calcium Carbonate in MT quantities.",
  });

  docs.push({
    title: "How we trade — sourcing, ports & logistics",
    filename: "how-we-trade.md",
    source: "live",
    documentType: "COMPANY",
    visibility: "PUBLIC",
    content: [
      site.about.trade.text,
      `We are traders, not manufacturers. Sourcing markets: ${markets}.`,
      site.about.trade.cards.map((c) => `${c.label}: ${c.text}`).join(". ") + ".",
    ].join("\n"),
  });

  docs.push({
    title: "Frequently asked questions",
    filename: "faq.md",
    source: "authored",
    documentType: "FAQ",
    visibility: "PUBLIC",
    content: [
      "Q: Which products does Oasis Impex supply? A: PVC Resin (K67 and K57), PET Resin (bottle grade, IV 0.80), PVC Regrind and Calcium Carbonate — in MT quantities.",
      "Q: What do I need to send to get a price quotation? A: Share the grade/product, quantity in MT, destination city and packaging preference. Our sales team responds with a firm quotation, usually the same working day.",
      "Q: Is there a minimum order quantity? A: MOQ is negotiated per product and destination. Ask our sales team for the current MOQ.",
      "Q: What are your payment terms? A: Payment terms are agreed per order and customer. Share your requirement and our sales team will confirm.",
      "Q: Do you supply samples or documents? A: We share product documentation, COA and certificates transparently before supply.",
      "Q: How long does delivery take? A: Lead time is about 15 days depending on product, origin and destination. We dispatch pan-India by truck and container.",
      "Q: Is Oasis Impex a manufacturer? A: No — we are an importer and trading house. We source from established producers and supply manufacturers across India.",
      "Q: How can I contact your sales team? A: Call our phone numbers, email, WhatsApp or use the chat on our website. A sales agent will respond promptly.",
    ].join("\n\n"),
  });

  docs.push({
    title: "Order & quotation process",
    filename: "order-process.md",
    source: "authored",
    documentType: "INTERNAL",
    visibility: "PUBLIC",
    content: [
      "How to place an enquiry or order: (1) Send us the product grade, quantity in MT, destination and packaging preference by phone, WhatsApp, email or chat. (2) Our sales team responds with a firm price and availability, usually the same working day. (3) We coordinate quality, packaging and pan-India dispatch from our Ahmedabad operations. (4) We follow up with documentation and support throughout the order.",
      "For urgent requirements, call us directly or use WhatsApp for the fastest response.",
    ].join("\n"),
  });

  return docs;
}
