import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for the Oasis Impex website.",
};

export default function TermsPage() {
  return (
    <section className="bg-mist pt-32 pb-20">
      <div className="container-x max-w-3xl">
        <p className="eyebrow text-brand">Legal</p>
        <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">Terms of Use</h1>
        <p className="mt-2 text-sm text-ink/50">Last updated: August 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink/70">
          <div>
            <h2 className="text-lg font-bold text-ink">1. General</h2>
            <p className="mt-2">
              These terms govern your use of the Oasis Impex website. By using this site you accept these terms. Product information shown here is indicative; final specifications, pricing and availability are confirmed in writing by our sales team.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">2. No financial or tax advice</h2>
            <p className="mt-2">
              This website does not provide pricing, tax, GST or financial advisory services. All commercial terms are established through direct business correspondence with Oasis Impex.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">3. Intellectual property</h2>
            <p className="mt-2">
              All content on this site — text, graphics and branding — is the property of Oasis Impex and may not be reproduced without permission.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">4. Limitation of liability</h2>
            <p className="mt-2">
              Oasis Impex is not liable for any indirect or consequential loss arising from the use of this website or reliance on its content.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">5. Governing law</h2>
            <p className="mt-2">
              These terms are governed by the laws of India. Disputes are subject to the jurisdiction of the courts of Ahmedabad, Gujarat.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
