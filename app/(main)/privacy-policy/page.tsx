import type { Metadata } from "next";
import type { ReactNode } from "react";
import DynamicTopNav from "@/components/ui/DynamicTopNav";
import {
  FileText,
  Handshake,
  CalendarCheck,
  Copyright,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const COMPANY = "Maraspot";
const SITE = "developer.maraspot.com";
const SUPPORT_EMAIL = "maraspot.ke@gmail.com";
const PHONE = "+254 113 388 120";
const LOCATION = "Nairobi, Kenya";
const LAST_UPDATED = "October 29, 2026";

export const metadata: Metadata = {
  title: `Terms of Service | ${COMPANY}`,
  description: `The terms that govern your use of ${COMPANY}'s website development services, including quotes, payments, revisions, ownership, and support.`,
};

const SECTIONS = [
  { id: "agreement", title: "Agreement to Terms" },
  { id: "services", title: "Our Services" },
  { id: "accounts", title: "Accounts & Eligibility" },
  { id: "quotes", title: "Quotes, Scope & Orders" },
  { id: "client-responsibilities", title: "Client Responsibilities" },
  { id: "payments", title: "Fees & Payments" },
  { id: "timelines", title: "Timelines & Delivery" },
  { id: "revisions", title: "Revisions & Change Requests" },
  { id: "ownership", title: "Ownership & Intellectual Property" },
  { id: "third-party", title: "Third-Party Services" },
  { id: "hosting", title: "Hosting, Domains & Maintenance" },
  { id: "acceptable-use", title: "Acceptable Use" },
  { id: "confidentiality", title: "Confidentiality & Privacy" },
  { id: "warranties", title: "Warranties & Disclaimers" },
  { id: "liability", title: "Limitation of Liability" },
  { id: "indemnity", title: "Indemnification" },
  { id: "termination", title: "Cancellation & Termination" },
  { id: "disputes", title: "Governing Law & Disputes" },
  { id: "changes", title: "Changes to These Terms" },
  { id: "contact", title: "Contact Us" },
] as const;

const HIGHLIGHTS = [
  {
    icon: Handshake,
    title: "Clear scope, no surprises",
    text: "Every project starts with an agreed quote, deliverables, and timeline.",
  },
  {
    icon: CalendarCheck,
    title: "Milestone-based payments",
    text: "Pay in stages as work progresses, with transparent invoicing.",
  },
  {
    icon: Copyright,
    title: "You own your website",
    text: "Final deliverables transfer to you once payment is complete.",
  },
];

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1f2228]">
      <DynamicTopNav title="Terms of Service" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Header */}
        <header className="mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 dark:bg-orange-500/15 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
            <FileText className="w-3.5 h-3.5" />
            Legal
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Terms of Service
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

        {/* Terms body */}
        <article className="rounded-2xl border border-gray-200 dark:border-[#343942] bg-white dark:bg-[#272b33] px-5 sm:px-8 py-2 shadow-sm dark:shadow-black/20 divide-y divide-gray-100 dark:divide-[#343942]">
          <Section id="agreement" n={1} title="Agreement to Terms">
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) form a binding
              agreement between you (&ldquo;Client&rdquo;, &ldquo;you&rdquo;)
              and <strong>{COMPANY}</strong> (&ldquo;we&rdquo;,
              &ldquo;us&rdquo;, &ldquo;our&rdquo;), a web development company
              based in {LOCATION}. They apply when you visit {SITE} (the
              &ldquo;Site&rdquo;), create an account, request a quote, or order
              any of our services (the &ldquo;Services&rdquo;).
            </p>
            <p>
              By using the Site or placing an order, you confirm that you have
              read, understood, and agree to these Terms and to our{" "}
              <a
                href="/privacy"
                className="text-orange-600 dark:text-orange-400 hover:underline"
              >
                Privacy Policy
              </a>
              . If you are entering into these Terms on behalf of a business,
              you confirm you have authority to bind that business. If a signed
              project agreement exists and conflicts with these Terms, the
              project agreement prevails for that project.
            </p>
          </Section>

          <Section id="services" n={2} title="Our Services">
            <p>
              We design, build, and launch websites and web applications,
              including:
            </p>
            <List>
              <li>Business and corporate websites;</li>
              <li>Online stores and e-commerce platforms;</li>
              <li>Portfolios, landing pages, and booking platforms;</li>
              <li>Custom web applications, dashboards, and integrations;</li>
              <li>
                Website redesigns, maintenance, hosting setup, and ongoing
                support, where agreed.
              </li>
            </List>
            <p>
              The exact Services, features, and deliverables for each project
              are set out in the quote or project proposal you accept.
            </p>
          </Section>

          <Section id="accounts" n={3} title="Accounts & Eligibility">
            <p>
              You must be at least 18 years old and able to enter into a binding
              contract to use our Services. To place orders or track projects
              you may need an account.
            </p>
            <List>
              <li>
                Provide accurate, current, and complete registration details and
                keep them up to date.
              </li>
              <li>
                Keep your password confidential. You are responsible for all
                activity under your account.
              </li>
              <li>
                Notify us immediately at <MailLink /> if you suspect
                unauthorized access.
              </li>
            </List>
            <p>
              We may suspend or close accounts that contain false information or
              breach these Terms.
            </p>
          </Section>

          <Section id="quotes" n={4} title="Quotes, Scope & Orders">
            <p>
              Quotes are estimates based on the information you provide and are
              valid for the period stated on the quote (30 days if none is
              stated). A project begins only when you accept the quote in
              writing (including through the Site, email, or WhatsApp) and any
              required deposit is received.
            </p>
            <List>
              <li>
                <strong>Defined scope.</strong> The accepted quote describes the
                pages, features, integrations, and deliverables included.
                Anything not listed is out of scope.
              </li>
              <li>
                <strong>Change in scope.</strong> Requests that go beyond the
                agreed scope are treated as change requests and may affect the
                price and timeline (see Section 8).
              </li>
              <li>
                <strong>Accuracy.</strong> Quotes can change if the brief you
                gave us was incomplete or inaccurate.
              </li>
            </List>
          </Section>

          <Section
            id="client-responsibilities"
            n={5}
            title="Client Responsibilities"
          >
            <p>
              A successful project depends on timely cooperation. You agree to:
            </p>
            <List>
              <li>
                Provide the content, images, logos, brand assets, and access we
                reasonably need, in usable formats and on time;
              </li>
              <li>
                Give feedback and approvals within the timeframes agreed
                (typically within 5 business days);
              </li>
              <li>
                Ensure you own or have licensed all content you supply, and that
                it does not infringe anyone&apos;s rights or break the law;
              </li>
              <li>
                Designate a single point of contact who can make decisions for
                your business;
              </li>
              <li>
                Obtain any consents, licenses, or permits your own business
                requires to operate online.
              </li>
            </List>
            <p>
              Delays caused by late content, feedback, or payments may move
              project dates and may incur additional charges.
            </p>
          </Section>

          <Section id="payments" n={6} title="Fees & Payments">
            <List>
              <li>
                <strong>Deposit and milestones.</strong> Unless the quote says
                otherwise, a deposit is due before work begins, with remaining
                payments tied to project milestones and a final payment due
                before launch or handover.
              </li>
              <li>
                <strong>Payment methods.</strong> We accept payments through
                M-Pesa, Flutterwave, Paystack, and other methods shown at
                checkout. Payments are processed by these providers, and their
                terms also apply. We do not see or store your card details or
                mobile money PIN.
              </li>
              <li>
                <strong>Currency and taxes.</strong> Prices are shown in the
                currency stated on your quote. Applicable taxes, such as VAT,
                and payment processor fees may be added where required.
              </li>
              <li>
                <strong>Late payment.</strong> Invoices are due by the date
                stated. We may pause work, withhold delivery, or take the
                project offline (where we host it) until overdue amounts are
                paid, and may charge reasonable interest or recovery costs where
                the law allows.
              </li>
              <li>
                <strong>Refunds.</strong> Deposits and completed milestone
                payments are generally non-refundable because they cover time
                and work already committed. If we fail to deliver the agreed
                scope, we will first work with you to correct it, and where we
                cannot, we will refund the portion attributable to undelivered
                work.
              </li>
            </List>
          </Section>

          <Section id="timelines" n={7} title="Timelines & Delivery">
            <p>
              Timelines in a quote are good-faith estimates, not guarantees.
              They assume that you supply content and feedback on schedule. We
              are not liable for delays caused by you, third-party providers, or
              events outside our reasonable control, such as power or internet
              outages, platform downtime, or force majeure events.
            </p>
            <p>
              A project is considered delivered when the agreed features are
              completed and made available to you for review or launch. If we do
              not hear from you within 7 days of delivery, the work is treated
              as accepted, apart from defects reported under Section 14.
            </p>
          </Section>

          <Section id="revisions" n={8} title="Revisions & Change Requests">
            <p>
              Each quote includes a set number of revision rounds for each stage
              (for example, design and development). A revision means an
              adjustment to work already delivered that matches the approved
              scope.
            </p>
            <List>
              <li>
                Additional rounds, new features, redesigns after approval, or
                changes to the agreed scope are charged separately.
              </li>
              <li>
                We will give you a revised quote and timeline before starting
                any change request, and work begins once you approve it.
              </li>
              <li>
                Approved designs are treated as final. Changes after sign-off
                may require extra time and fees.
              </li>
            </List>
          </Section>

          <Section
            id="ownership"
            n={9}
            title="Ownership & Intellectual Property"
          >
            <List>
              <li>
                <strong>Your content.</strong> You retain all rights to the
                content, brand assets, and materials you provide. You grant us a
                limited license to use them solely to deliver and support your
                project.
              </li>
              <li>
                <strong>Final deliverables.</strong> Once you have paid in full,
                ownership of the custom website design and code written
                specifically for you transfers to you, unless the project
                agreement says otherwise.
              </li>
              <li>
                <strong>Our tools and pre-existing materials.</strong> We keep
                ownership of our pre-existing code, frameworks, templates,
                libraries, and know-how. Where these are part of your website,
                you receive a non-exclusive, perpetual license to use them as
                part of that website.
              </li>
              <li>
                <strong>Third-party and open-source components.</strong> These
                remain subject to their own licenses, which you agree to follow.
              </li>
              <li>
                <strong>Portfolio.</strong> We will not showcase your project,
                brand, or testimonial publicly without your permission.
              </li>
              <li>
                <strong>Until payment.</strong> Until full payment is received,
                we retain ownership of the work and may withhold or disable
                delivered files.
              </li>
            </List>
          </Section>

          <Section id="third-party" n={10} title="Third-Party Services">
            <p>
              Websites often rely on services we do not control, such as payment
              gateways, hosting providers, domain registrars, email services,
              analytics, maps, plugins, and APIs. Their availability, pricing,
              and terms are set by the providers. Costs for these services
              (licenses, subscriptions, domains, transaction fees) are your
              responsibility unless the quote states otherwise. We are not
              liable for outages, changes, or discontinuation of third-party
              services.
            </p>
          </Section>

          <Section id="hosting" n={11} title="Hosting, Domains & Maintenance">
            <List>
              <li>
                <strong>Hosting and domains.</strong> Where we set up hosting or
                register domains for you, they are registered in your name or
                transferred to you on request, subject to payment of all
                outstanding amounts.
              </li>
              <li>
                <strong>Maintenance and support.</strong> Unless a maintenance
                or support plan is agreed in writing, support after launch is
                limited to the warranty period in Section 14.
              </li>
              <li>
                <strong>Backups and content.</strong> Where we host or maintain
                your site, we take reasonable steps to back it up, but you
                should keep your own copies of important content and data.
              </li>
              <li>
                <strong>Access credentials.</strong> Share access only as needed
                and change or revoke credentials when the work ends.
              </li>
            </List>
          </Section>

          <Section id="acceptable-use" n={12} title="Acceptable Use">
            <p>
              You agree not to use our Site or Services, or request a website
              that is used, to:
            </p>
            <List>
              <li>
                Break any law, or infringe copyright, trademarks, or other
                rights;
              </li>
              <li>
                Distribute malware, run phishing or fraud schemes, or collect
                personal data unlawfully;
              </li>
              <li>
                Promote hate, harassment, exploitation of minors, or other
                illegal or harmful content;
              </li>
              <li>
                Attempt to breach, probe, or disrupt the security of the Site or
                our systems;
              </li>
              <li>
                Resell or misrepresent our work as your own without our
                agreement.
              </li>
            </List>
            <p>
              We may refuse or stop any project that breaches this section, with
              no refund of amounts for work already done.
            </p>
          </Section>

          <Section
            id="confidentiality"
            n={13}
            title="Confidentiality & Privacy"
          >
            <p>
              Each party agrees to keep the other&apos;s non-public business
              information, credentials, and project materials confidential and
              to use them only for the project. This does not apply to
              information that is public, already known, independently
              developed, or required to be disclosed by law.
            </p>
            <p>
              Our handling of personal data is described in our Privacy Policy.
              If your website collects personal data from your own visitors or
              customers, you are the data controller for that data and are
              responsible for publishing your own privacy policy and complying
              with applicable data protection law, including Kenya&apos;s Data
              Protection Act, 2019.
            </p>
          </Section>

          <Section id="warranties" n={14} title="Warranties & Disclaimers">
            <p>
              We will perform the Services with reasonable skill and care. For{" "}
              <strong>30 days after launch</strong> (or as stated in your
              quote), we will fix, free of charge, defects in the delivered work
              that do not match the agreed scope. This warranty does not cover
              issues caused by changes made by anyone else, third-party
              services, hosting problems, or new feature requests.
            </p>
            <p>
              Except as stated here, and to the fullest extent permitted by law,
              the Services are provided &ldquo;as is&rdquo;. We do not guarantee
              that a website will be uninterrupted or error-free, nor any
              particular result, such as search engine rankings, traffic,
              conversions, sales, or revenue.
            </p>
          </Section>

          <Section id="liability" n={15} title="Limitation of Liability">
            <p>To the fullest extent permitted by law:</p>
            <List>
              <li>
                We are not liable for indirect, incidental, special, or
                consequential losses, including lost profits, lost revenue, loss
                of data, or loss of business opportunity;
              </li>
              <li>
                Our total liability arising from a project is limited to the
                amount you paid us for that project in the 12 months before the
                claim arose.
              </li>
            </List>
            <p>
              Nothing in these Terms limits liability that cannot be limited
              under applicable law, such as liability for fraud or for death or
              personal injury caused by negligence.
            </p>
          </Section>

          <Section id="indemnity" n={16} title="Indemnification">
            <p>
              You agree to indemnify and hold {COMPANY} harmless from claims,
              losses, and expenses (including reasonable legal fees) arising
              from content you provide, your use of the delivered website, or
              your breach of these Terms or any law.
            </p>
          </Section>

          <Section id="termination" n={17} title="Cancellation & Termination">
            <List>
              <li>
                <strong>By you.</strong> You may cancel a project by written
                notice. You will pay for work completed up to the date of
                cancellation and any non-refundable costs we have incurred.
              </li>
              <li>
                <strong>By us.</strong> We may suspend or end a project if you
                breach these Terms, fail to pay, or stop responding for an
                extended period (for example, 30 days), after giving you notice
                where reasonable.
              </li>
              <li>
                <strong>Effect.</strong> On termination, amounts due become
                payable, and we will hand over completed work once you have paid
                for it. Sections that by their nature should survive (payments,
                ownership, confidentiality, liability, indemnity, disputes)
                continue to apply.
              </li>
            </List>
          </Section>

          <Section id="disputes" n={18} title="Governing Law & Disputes">
            <p>
              These Terms are governed by the laws of Kenya. If a dispute
              arises, we encourage you to contact us first so we can try to
              resolve it in good faith. If it cannot be resolved informally
              within 30 days, the dispute will be submitted to mediation or, if
              needed, to the courts of Kenya, which will have jurisdiction,
              except where the law of your country gives you mandatory rights to
              a different forum.
            </p>
          </Section>

          <Section id="changes" n={19} title="Changes to These Terms">
            <p>
              We may update these Terms from time to time. We will post the
              updated version on this page and, for material changes, notify you
              through the Site or by email. Changes do not affect projects
              already accepted unless you agree. Continued use of the Site or
              Services after an update means you accept the revised Terms. The
              &ldquo;Last updated&rdquo; date above shows when these Terms were
              last revised.
            </p>
          </Section>

          <Section id="contact" n={20} title="Contact Us">
            <p>
              For questions about these Terms, quotes, or your project, contact
              us:
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
      href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Terms enquiry")}`}
      className="text-orange-600 dark:text-orange-400 hover:underline"
    >
      {SUPPORT_EMAIL}
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
