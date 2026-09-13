import Head from "next/head";
import { ReactNode } from "react";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | [Company Name]</title>
        <meta
          name="description"
          content="Privacy Policy explaining how [Company Name] collects, uses, and protects your data."
        />
      </Head>

      <main className="max-w-3xl mx-auto px-6 py-12 text-gray-800">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">
          Last updated: [Month Day, Year]
        </p>

        <Section title="1. Introduction">
          <p>
            <strong>[Company Name]</strong> ("we", "us", "our") is committed to
            protecting your privacy. This Privacy Policy explains how we
            collect, use, store, and protect your personal data when you use
            [yourdomain.com] ("Site") and our website development services
            ("Services"), in line with Kenya's Data Protection Act, 2019
            ("DPA"), and — because we serve customers worldwide — recognized
            international best practices reflected in frameworks such as the EU
            General Data Protection Regulation (GDPR).
          </p>
        </Section>

        <Section title="2. Data We Collect">
          <p>We collect the following categories of personal data:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>
              <strong>Contact & authentication data:</strong> your name, email
              address, and phone number, collected when you register an account
              or place an order.
            </li>
            <li>
              <strong>Project data:</strong> content, briefs, and files you
              submit for your website project.
            </li>
            <li>
              <strong>Payment data:</strong> transaction references and payment
              status from our payment gateways (e.g. M-Pesa, Flutterwave,
              Paystack). We do not collect or store your full card numbers,
              mobile money PIN, or bank credentials — these are handled directly
              by the payment processor.
            </li>
            <li>
              <strong>Technical data:</strong> IP address, browser type, device
              information, and cookies used for security and site functionality.
            </li>
          </ul>
        </Section>

        <Section title="3. Why We Collect Your Data">
          <p>We use your email and phone number specifically to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>
              Authenticate your account and verify your identity (e.g. login
              codes, password resets);
            </li>
            <li>
              Communicate with you about your project, invoices, and support;
            </li>
            <li>
              Send essential service notices (e.g. order confirmations, delivery
              updates).
            </li>
          </ul>
          <p className="mt-3">
            We process this data on the legal bases of contract performance
            (delivering the Services you requested), legitimate interest
            (account security, fraud prevention), and, where required, consent.
          </p>
        </Section>

        <Section title="4. How We Share Your Data">
          <p>
            <strong>
              We do not sell or share your personal data with third parties for
              marketing purposes.
            </strong>{" "}
            Your data is only disclosed to:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>
              Payment processors (M-Pesa, Flutterwave, Paystack), solely to
              complete your transaction;
            </li>
            <li>
              Service providers who support our infrastructure (e.g. hosting,
              email delivery), under confidentiality obligations;
            </li>
            <li>
              Authorities, where required by law, court order, or to protect our
              legal rights.
            </li>
          </ul>
        </Section>

        <Section title="5. Data Retention">
          <p>
            We retain your personal data only for as long as necessary to
            provide the Services, comply with legal/tax obligations, resolve
            disputes, and enforce our agreements. Account data is deleted or
            anonymized upon request, subject to legal retention requirements.
          </p>
        </Section>

        <Section title="6. Your Rights">
          <p>
            Under the Kenya Data Protection Act (and equivalent rights
            recognized for our international customers, e.g. under GDPR), you
            have the right to:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Access the personal data we hold about you;</li>
            <li>Request correction of inaccurate data;</li>
            <li>
              Request deletion of your data, subject to legal obligations;
            </li>
            <li>Object to or restrict certain processing;</li>
            <li>Request a copy of your data in a portable format;</li>
            <li>Withdraw consent where processing is based on consent;</li>
            <li>
              Lodge a complaint with Kenya's Office of the Data Protection
              Commissioner (ODPC), or your local data protection authority.
            </li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, contact us at{" "}
            <a
              href="mailto:[privacy email]"
              className="text-blue-600 underline"
            >
              [privacy email]
            </a>
            .
          </p>
        </Section>

        <Section title="7. Data Security">
          <p>
            We implement reasonable technical and organizational measures —
            including encryption in transit, access controls, and secure
            authentication — to protect your data against unauthorized access,
            loss, or misuse. No system is completely secure, and we encourage
            you to use a strong, unique password.
          </p>
        </Section>

        <Section title="8. International Data Transfers">
          <p>
            As we serve customers globally, your data may be processed on
            servers located outside your country of residence, including in
            Kenya. Where data is transferred internationally, we take reasonable
            steps to ensure it is protected consistently with this Policy and
            applicable law.
          </p>
        </Section>

        <Section title="9. Cookies">
          <p>
            We use cookies and similar technologies to keep you logged in,
            remember preferences, and understand basic Site usage. You can
            control cookies through your browser settings; disabling them may
            affect certain Site features.
          </p>
        </Section>

        <Section title="10. Children's Privacy">
          <p>
            Our Services are not directed at children under 18. We do not
            knowingly collect personal data from children. If you believe a
            child has provided us data, contact us so we can delete it.
          </p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p>
            We may update this Privacy Policy periodically. Material changes
            will be communicated via the Site or by email. The "Last updated"
            date above reflects the most recent revision.
          </p>
        </Section>

        <Section title="12. Contact Us">
          <p>
            For privacy-related questions or requests, contact our Data
            Protection contact at{" "}
            <a
              href="mailto:[privacy email]"
              className="text-blue-600 underline"
            >
              [privacy email]
            </a>{" "}
            or [business phone/address].
          </p>
        </Section>
      </main>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="text-gray-700 leading-relaxed">{children}</div>
    </section>
  );
}
