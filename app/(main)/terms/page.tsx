import { ReactNode } from "react";
import Head from "next/head";

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service | [Company Name]</title>
        <meta
          name="description"
          content="Terms of Service for [Company Name] website development services."
        />
      </Head>

      <main className="max-w-3xl mx-auto px-6 py-12 text-gray-800">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">
          Last updated: [Month Day, Year]
        </p>

        <Section title="1. Introduction">
          <p>
            These Terms of Service ("Terms") govern your access to and use of
            the website development and related services ("Services") provided
            by <strong>[Company Name]</strong> ("we", "us", "our"), a business
            registered in Kenya, offering Services to customers worldwide via
            [yourdomain.com] ("Site").
          </p>
          <p className="mt-3">
            By creating an account, placing an order, or otherwise using our
            Services, you ("Client", "you") agree to be bound by these Terms. If
            you do not agree, please do not use our Services.
          </p>
        </Section>

        <Section title="2. Description of Services">
          <p>
            We design, build, and deliver websites for customers on a project or
            contract basis. Orders, project briefs, revisions, and deliverables
            are managed through the Site and, where applicable, via email or
            phone communication.
          </p>
        </Section>

        <Section title="3. Account Registration & Authentication">
          <p>
            To use certain features of the Site (e.g. submitting a project,
            tracking order status, or making payments), you must create an
            account and provide accurate information, including a valid email
            address and phone number. These are used solely to:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>
              Verify your identity and secure your account (authentication,
              OTPs, login alerts);
            </li>
            <li>
              Communicate about your order, invoices, and support requests;
            </li>
            <li>Send important notices about the Services.</li>
          </ul>
          <p className="mt-3">
            You are responsible for maintaining the confidentiality of your
            login credentials and for all activity under your account. Notify us
            immediately at [support email] if you suspect unauthorized access.
          </p>
        </Section>

        <Section title="4. Orders, Pricing & Payment">
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Prices for Services are displayed on the Site and may be quoted in
              Kenya Shillings (KES) or another currency depending on your
              location.
            </li>
            <li>
              Payments are processed through third-party payment gateways (e.g.
              M-Pesa, Flutterwave, Paystack). We do not collect or store your
              full card, mobile money PIN, or banking credentials — these are
              handled directly by the payment processor under their own terms
              and security standards.
            </li>
            <li>
              Orders are confirmed only once payment (in full or as per the
              agreed payment schedule/deposit) is successfully received.
            </li>
            <li>
              Refunds, cancellations, and dispute handling for a project are
              subject to our refund policy stated at checkout or in your project
              agreement. Unless otherwise agreed in writing, fees for work
              already completed are non-refundable.
            </li>
            <li>
              You are responsible for any transaction fees, currency conversion
              charges, or taxes (e.g. VAT) applicable to your payment.
            </li>
          </ul>
        </Section>

        <Section title="5. Project Delivery & Revisions">
          <p>
            Project timelines, number of revisions, and delivery formats will be
            as agreed in your project brief/quotation. Delays caused by late
            feedback, incomplete content, or late payment from the Client may
            extend delivery timelines accordingly.
          </p>
        </Section>

        <Section title="6. Intellectual Property">
          <p>
            Upon full payment, ownership of the final delivered website
            (excluding third-party licensed assets, plugins, stock media, or
            open-source components) transfers to the Client. We retain the right
            to showcase completed work in our portfolio and marketing materials
            unless you request otherwise in writing.
          </p>
        </Section>

        <Section title="7. Client Responsibilities">
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Provide accurate project requirements, content, and timely
              feedback;
            </li>
            <li>
              Ensure any content, logos, or media you supply do not infringe
              third-party rights;
            </li>
            <li>Use the Services only for lawful purposes.</li>
          </ul>
        </Section>

        <Section title="8. Acceptable Use">
          <p>
            You may not use the Site or Services to transmit unlawful,
            defamatory, or fraudulent content, attempt to breach system
            security, or interfere with other users' access to the Site.
          </p>
        </Section>

        <Section title="9. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, [Company Name] shall not be
            liable for any indirect, incidental, or consequential damages
            arising from your use of the Services, including loss of data,
            revenue, or business opportunities. Our total liability for any
            claim shall not exceed the amount paid by you for the specific
            project giving rise to the claim.
          </p>
        </Section>

        <Section title="10. Termination">
          <p>
            We may suspend or terminate your account if you breach these Terms.
            You may close your account at any time by contacting us, subject to
            settlement of any outstanding project fees.
          </p>
        </Section>

        <Section title="11. Governing Law & Dispute Resolution">
          <p>
            These Terms are governed by the laws of the Republic of Kenya. Where
            you access our Services from outside Kenya, you remain responsible
            for complying with your local laws. Any dispute arising from these
            Terms shall first be addressed through good-faith negotiation, and
            if unresolved, submitted to arbitration or the competent courts of
            Kenya, unless mandatory local consumer-protection law in your
            country provides otherwise.
          </p>
        </Section>

        <Section title="12. Changes to These Terms">
          <p>
            We may update these Terms from time to time. Continued use of the
            Services after changes are posted constitutes acceptance of the
            revised Terms.
          </p>
        </Section>

        <Section title="13. Contact Us">
          <p>
            Questions about these Terms can be sent to{" "}
            <a
              href="mailto:[support email]"
              className="text-blue-600 underline"
            >
              [support email]
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
