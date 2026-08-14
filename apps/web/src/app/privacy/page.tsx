import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for the Oasis Impex website.",
};

export default function PrivacyPage() {
  return (
    <section className="bg-mist pt-32 pb-20">
      <div className="container-x max-w-3xl">
        <p className="eyebrow text-brand">Legal</p>
        <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-ink/50">Last updated: August 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink/70">
          <div>
            <h2 className="text-lg font-bold text-ink">1. Information we collect</h2>
            <p className="mt-2">
              When you use our contact form or chat assistant, we collect the information you provide: name, company, phone, WhatsApp number, email, quantity requirements and message content. We also collect basic technical data such as your IP address and browser type for security and analytics.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">2. How we use it</h2>
            <p className="mt-2">
              We use your information solely to respond to inquiries, provide quotations, manage your supply relationship and improve our services. We do not sell or rent your personal data to anyone.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">3. Data retention</h2>
            <p className="mt-2">
              Inquiry and chat data is retained only as long as needed for legitimate business purposes. You may request access, correction or deletion of your data by contacting us.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">4. Security</h2>
            <p className="mt-2">
              We use encryption in transit, hashed credentials, role-based access controls and audit logging to protect your data from unauthorised access.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">5. Contact</h2>
            <p className="mt-2">
              For privacy questions, contact Oasis Impex at 1112, Fortune Business Hub, Science City Road, Ahmedabad, Gujarat 380060, India, or email info@oasisimpex.in.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
