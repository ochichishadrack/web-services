import type { Metadata } from "next";
import type { ReactNode } from "react";
import DynamicTopNav from "@/components/ui/DynamicTopNav";
import {
  ShieldCheck,
  Ban,
  Lock,
  UserCheck,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const COMPANY = "Maraspot";
const SITE = "developer.maraspot.com";
const PRIVACY_EMAIL = "maraspot.ke@gmail.com";
const PHONE = "+254 113 388 120";
const LOCATION = "Nairobi, Kenya";
const LAST_UPDATED = "October 29, 2026";

export const metadata: Metadata = {
  title: `Privacy Policy | ${COMPANY}`,
  description: `How ${COMPANY} collects, uses, and protects your personal data when you use our website development services.`,
};

const SECTIONS = [
  { id: "introduction", title: "Introduction" },
  { id: "data-we-collect", title: "Information We Collect" },
  { id: "how-we-use", title: "How We Use Your Information" },
  { id: "legal-bases", title: "Legal Bases for Processing" },
  { id: "client-content", title: "Client Content & Project Data" },
  { id: "sharing", title: "How We Share Information" },
  { id: "communications", title: "Emails & Newsletter" },
  { id: "cookies", title: "Cookies" },
  { id: "retention", title: "Data Retention" },
  { id: "security", title: "Data Security" },
  { id: "transfers", title: "International Transfers" },
  { id: "rights", title: "Your Rights" },
  { id: "children", title: "Children's Privacy" },
  { id: "third-party", title: "Third-Party Links & Services" },
  { id: "changes", title: "Changes to This Policy" },
  { id: "contact", title: "Contact Us" },
] as const;

const HIGHLIGHTS = [
  {
    icon: Ban,
    title: "We never sell your data",
    text: "Your information is not sold or shared for third-party marketing.",
  },
  {
    icon: Lock,
    title: "Payments stay with processors",
    text: "We never see or store your card details or mobile money PIN.",
  },
  {
    icon: UserCheck,
    title: "You stay in control",
    text: "Access, correct, export, or delete your data at any time.",
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1f2228]">
      <DynamicTopNav title="Privacy Policy" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Header */}
        <header className="mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 dark:bg-orange-500/15 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            Legal
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Last updated: {LAST_UPDATED}
          </p>
        </header>

        {/* Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-200 dark:border-[#343942] bg-white dark:bg-[#272b33] p-4 shadow-sm dark:shadow-black/20"
            >
              <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-500/15 flex items-center justify-center mb-3">
                <Icon className="w-4.5 h-4.5 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                {text}
              </p>
            </div>
          ))}
        </div>

        {/* Table of contents */}
        <nav
          aria-label="Table of contents"
          className="rounded-2xl border border-gray-200 dark:border-[#343942] bg-white dark:bg-[#272b33] p-5 sm:p-6 mb-8 shadow-sm dark:shadow-black/20"
        >
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Contents
          </p>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
            {SECTIONS.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition"
                >
                  <span className="tabular-nums text-gray-400 dark:text-gray-500 mr-2">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Policy body */}
        <article className="rounded-2xl border border-gray-200 dark:border-[#343942] bg-white dark:bg-[#272b33] px-5 sm:px-8 py-2 shadow-sm dark:shadow-black/20 divide-y divide-gray-100 dark:divide-[#343942]">
          <Section id="introduction" n={1} title="Introduction">
            <p>
              <strong>{COMPANY}</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
              &ldquo;our&rdquo;) is a web development company based in{" "}
              {LOCATION}. We design, build, and launch websites and web
              applications, including business sites, online stores, portfolios,
              booking platforms, and custom web apps.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, store, and
              protect personal data when you visit {SITE} (the
              &ldquo;Site&rdquo;), create an account, request a quote, or order
              our services (the &ldquo;Services&rdquo;). We handle personal data
              in line with Kenya&apos;s Data Protection Act, 2019
              (&ldquo;DPA&rdquo;) and, because we serve clients worldwide, with
              internationally recognized practices such as those in the EU
              General Data Protection Regulation (GDPR).
            </p>
            <p>
              By using the Site or our Services, you acknowledge that you have
              read and understood this Policy. Our use of the Services is also
              governed by our{" "}
              <a
                href="/terms"
                className="text-orange-600 dark:text-orange-400 hover:underline"
              >
                Terms of Service
              </a>
              .
            </p>
          </Section>

          <Section id="data-we-collect" n={2} title="Information We Collect">
            <p>
              We collect only what we need to deliver and support our Services:
            </p>
            <List>
              <li>
                <strong>Account and contact data:</strong> your name, email
                address, and phone numbers, collected when you register, request
                a quote, or place an order.
              </li>
              <li>
                <strong>Quote and project data:</strong> project titles,
                descriptions, budgets, timelines, briefs, and any files,
                content, or credentials you share so we can build your project.
              </li>
              <li>
                <strong>Payment data:</strong> transaction references, amounts,
                and payment status from our payment gateways (such as M-Pesa,
                Flutterwave, and Paystack). We do not collect or store your full
                card number, mobile money PIN, or bank credentials. These are
                handled directly by the payment processor.
              </li>
              <li>
                <strong>Communications:</strong> messages you send us by form,
                email, or WhatsApp, and records of support requests.
              </li>
              <li>
                <strong>Preferences:</strong> your newsletter subscription
                status and your acceptance of our Privacy Policy and Terms.
              </li>
              <li>
                <strong>Technical data:</strong> IP address, browser type,
                device information, pages visited, and cookies used for security
                and site functionality.
              </li>
            </List>
          </Section>

          <Section id="how-we-use" n={3} title="How We Use Your Information">
            <p>We use your personal data to:</p>
            <List>
              <li>Create and secure your account, and verify your identity;</li>
              <li>
                Prepare quotes and deliver the websites or services you order;
              </li>
              <li>
                Communicate with you about your project, milestones, invoices,
                and support requests;
              </li>
              <li>Process payments and keep accurate financial records;</li>
              <li>
                Send essential service notices such as order confirmations,
                payment verification, and project updates;
              </li>
              <li>
                Send our newsletter and service updates, only where you have
                opted in;
              </li>
              <li>
                Prevent fraud, protect the security of the Site, and comply with
                legal obligations.
              </li>
            </List>
          </Section>

          <Section id="legal-bases" n={4} title="Legal Bases for Processing">
            <p>We process your personal data on the following grounds:</p>
            <List>
              <li>
                <strong>Contract:</strong> to provide a quote, deliver the
                Services you requested, and take steps before entering into a
                contract with you.
              </li>
              <li>
                <strong>Legitimate interests:</strong> account security, fraud
                prevention, service improvement, and business administration,
                where these do not override your rights.
              </li>
              <li>
                <strong>Legal obligation:</strong> tax, accounting, and
                regulatory requirements.
              </li>
              <li>
                <strong>Consent:</strong> for optional activities such as our
                newsletter. You can withdraw consent at any time.
              </li>
            </List>
          </Section>

          <Section
            id="client-content"
            n={5}
            title="Client Content & Project Data"
          >
            <p>
              When we build a website for you, we handle content and data you
              provide, such as text, images, logos, brand assets, customer
              lists, and access credentials. We use this material only to
              deliver and support your project.
            </p>
            <List>
              <li>
                <strong>Your content remains yours.</strong> You confirm that
                you have the right to share it with us. Ownership of final
                deliverables is governed by your project agreement or our Terms.
              </li>
              <li>
                <strong>Websites we build for you.</strong> If your website
                collects personal data from your own visitors or customers (for
                example, orders, bookings, or contact forms), you are the data
                controller for that data and we act as your processor when we
                host or maintain it. You are responsible for publishing your own
                privacy policy and obtaining any required consents.
              </li>
              <li>
                <strong>Credentials and access.</strong> Any hosting, domain, or
                third-party account access you share is used solely for your
                project and should be revoked or rotated once the work or
                maintenance period ends.
              </li>
              <li>
                <strong>Portfolio.</strong> We will not publish your project,
                brand, or testimonial in our portfolio without your permission.
              </li>
            </List>
          </Section>

          <Section id="sharing" n={6} title="How We Share Information">
            <p>
              <strong>
                We do not sell your personal data, and we do not share it with
                third parties for their marketing purposes.
              </strong>{" "}
              We disclose information only to:
            </p>
            <List>
              <li>
                <strong>Payment processors</strong> (M-Pesa, Flutterwave,
                Paystack) solely to complete and verify your transactions;
              </li>
              <li>
                <strong>Service providers</strong> that support our operations,
                such as hosting and infrastructure, email delivery, analytics,
                and communication tools, under confidentiality and data
                protection obligations;
              </li>
              <li>
                <strong>Professional advisers</strong> such as accountants and
                legal counsel, where needed;
              </li>
              <li>
                <strong>Authorities</strong>, where required by law, court
                order, or to protect our legal rights;
              </li>
              <li>
                A successor entity, if our business is reorganized or
                transferred, with your data remaining protected under this
                Policy.
              </li>
            </List>
          </Section>

          <Section id="communications" n={7} title="Emails & Newsletter">
            <p>
              We send two kinds of messages. <strong>Service messages</strong>{" "}
              (order confirmations, payment verification, project updates, and
              security notices) are necessary to provide the Services and cannot
              be turned off while you have an active account.
            </p>
            <p>
              <strong>Newsletter and promotional messages</strong> are sent only
              if you subscribe and accept this Policy and our Terms. You can
              unsubscribe at any time from the newsletter page in your account
              settings or by contacting us. Unsubscribing does not affect
              service messages.
            </p>
          </Section>

          <Section id="cookies" n={8} title="Cookies">
            <p>
              We use cookies and similar technologies to keep you signed in,
              remember your preferences (such as light or dark mode), protect
              against abuse, and understand basic Site usage. You can control
              cookies through your browser settings, but disabling them may
              affect features such as login and your account dashboard.
            </p>
          </Section>

          <Section id="retention" n={9} title="Data Retention">
            <p>
              We keep personal data only as long as necessary to provide the
              Services, meet tax and accounting requirements, resolve disputes,
              and enforce our agreements.
            </p>
            <List>
              <li>
                <strong>Account data</strong> is kept while your account is
                active and deleted or anonymized when you request deletion,
                subject to legal retention requirements.
              </li>
              <li>
                <strong>Financial records</strong> are retained for the period
                required by Kenyan tax and accounting law.
              </li>
              <li>
                <strong>Project files and credentials</strong> are retained for
                the duration of the project and any agreed support period, then
                securely deleted or returned on request.
              </li>
            </List>
          </Section>

          <Section id="security" n={10} title="Data Security">
            <p>
              We use reasonable technical and organizational measures to protect
              your data, including encryption in transit, access controls,
              secure authentication, and limiting access to personnel who need
              it. No system is completely secure, so we encourage you to use a
              strong, unique password and to keep your credentials private.
            </p>
            <p>
              If a personal data breach occurs that is likely to put your rights
              at risk, we will notify the Office of the Data Protection
              Commissioner and affected individuals as required by law.
            </p>
          </Section>

          <Section id="transfers" n={11} title="International Transfers">
            <p>
              We serve clients globally, so your data may be processed or stored
              on servers outside your country of residence, including outside
              Kenya. Where we transfer data internationally, we take reasonable
              steps to ensure it is protected consistently with this Policy and
              applicable data protection law.
            </p>
          </Section>

          <Section id="rights" n={12} title="Your Rights">
            <p>
              Under the Kenya Data Protection Act, and equivalent rights
              recognized for our international clients, you have the right to:
            </p>
            <List>
              <li>Be informed about how your personal data is used;</li>
              <li>Access the personal data we hold about you;</li>
              <li>Request correction of inaccurate or incomplete data;</li>
              <li>
                Request deletion of your data, subject to legal obligations;
              </li>
              <li>Object to or restrict certain processing;</li>
              <li>Receive your data in a portable format;</li>
              <li>Withdraw consent where processing is based on consent;</li>
              <li>
                Lodge a complaint with Kenya&apos;s Office of the Data
                Protection Commissioner (ODPC) or your local data protection
                authority.
              </li>
            </List>
            <p>
              You can update most of your details directly in your account
              settings. For any other request, email us at <MailLink />. We may
              need to verify your identity before acting on a request.
            </p>
          </Section>

          <Section id="children" n={13} title="Children's Privacy">
            <p>
              Our Services are intended for businesses and adults and are not
              directed at children under 18. We do not knowingly collect
              personal data from children. If you believe a child has provided
              us with personal data, please contact us so we can delete it.
            </p>
          </Section>

          <Section id="third-party" n={14} title="Third-Party Links & Services">
            <p>
              The Site and the websites we build may link to or integrate
              third-party services such as payment gateways, maps, analytics, or
              social platforms. These services have their own privacy practices,
              and we are not responsible for them. We encourage you to review
              their policies before sharing personal data.
            </p>
          </Section>

          <Section id="changes" n={15} title="Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in our Services or legal requirements. We will post the
              updated version on this page and, for material changes, notify you
              through the Site or by email. The &ldquo;Last updated&rdquo; date
              above shows when this Policy was last revised.
            </p>
          </Section>

          <Section id="contact" n={16} title="Contact Us">
            <p>
              For privacy questions, requests, or complaints, contact our data
              protection contact:
            </p>
            <div className="mt-4 rounded-xl border border-gray-200 dark:border-[#343942] bg-gray-50 dark:bg-[#1f2228] p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {COMPANY}
              </p>
              <ContactRow icon={Mail}>
                <MailLink />
              </ContactRow>
              <ContactRow icon={Phone}>
                <a
                  href={`tel:${PHONE.replace(/\s/g, "")}`}
                  className="text-orange-600 dark:text-orange-400 hover:underline"
                >
                  {PHONE}
                </a>
              </ContactRow>
              <ContactRow icon={MapPin}>{LOCATION}</ContactRow>
            </div>
          </Section>
        </article>

        <p className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500">
          © {new Date().getFullYear()} {COMPANY}. All rights reserved.
        </p>
      </main>
    </div>
  );
}

function Section({
  id,
  n,
  title,
  children,
}: {
  id: string;
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-7">
      <h2 className="flex items-baseline gap-3 text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
        <span className="text-sm font-semibold tabular-nums text-orange-500">
          {String(n).padStart(2, "0")}
        </span>
        {title}
      </h2>
      <div className="space-y-3 text-sm sm:text-[15px] leading-relaxed text-gray-600 dark:text-gray-400 [&_strong]:font-semibold [&_strong]:text-gray-800 dark:[&_strong]:text-gray-200">
        {children}
      </div>
    </section>
  );
}

function List({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc pl-5 space-y-2 marker:text-orange-500">
      {children}
    </ul>
  );
}

function MailLink() {
  return (
    <a
      href={`mailto:${PRIVACY_EMAIL}?subject=${encodeURIComponent("Privacy request")}`}
      className="text-orange-600 dark:text-orange-400 hover:underline"
    >
      {PRIVACY_EMAIL}
    </a>
  );
}

function ContactRow({
  icon: Icon,
  children,
}: {
  icon: typeof Mail;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300">
      <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
