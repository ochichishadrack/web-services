"use client";

import { useState } from "react";
import DynamicTopNav from "@/components/ui/DynamicTopNav";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: "1",
    question: "What web development services do you offer?",
    answer:
      "We provide end-to-end web development services including custom website development, web applications, eCommerce platforms, UI/UX design, API integrations, performance optimization, and ongoing maintenance. Our solutions are scalable, secure, and tailored to your business goals.",
  },
  {
    id: "2",
    question: "How long does it take to build a website or web app?",
    answer:
      "Project timelines depend on complexity and requirements. A standard business website typically takes 2–4 weeks, while custom web applications or eCommerce platforms may take 4–10 weeks. After reviewing your requirements, we provide a clear project roadmap with milestones.",
  },
  {
    id: "3",
    question: "Do you build custom solutions or use templates?",
    answer:
      "We specialize in fully custom-built solutions designed specifically for your brand and business needs. However, we can also work with premium frameworks or starter templates if that aligns with your timeline and budget.",
  },
  {
    id: "4",
    question: "How much does a project cost?",
    answer:
      "Pricing varies based on project scope, features, integrations, and timeline. We offer flexible pricing models including fixed-price projects and milestone-based payments. Contact us for a detailed proposal tailored to your requirements.",
  },
  {
    id: "5",
    question: "Will my website be mobile-friendly and SEO optimized?",
    answer:
      "Yes. All our websites are fully responsive across devices and built with modern SEO best practices, optimized performance, fast load speeds, and clean code structure to help improve visibility on search engines.",
  },
  {
    id: "6",
    question: "Do you provide ongoing support and maintenance?",
    answer:
      "Absolutely. We offer post-launch support, security updates, performance monitoring, feature upgrades, and maintenance plans to ensure your platform runs smoothly and stays up to date.",
  },
  {
    id: "7",
    question: "Can you integrate third-party tools and payment gateways?",
    answer:
      "Yes. We integrate APIs, CRMs, payment gateways, analytics tools, email systems, and other third-party services to streamline your business operations and enhance user experience.",
  },
  {
    id: "8",
    question: "How do we get started?",
    answer:
      "Simply reach out through our contact form or request a consultation. We’ll schedule a discovery call to understand your goals, define requirements, and provide a detailed proposal with timeline and cost breakdown.",
  },
];

export default function FAQPage() {
  const [openFAQId, setOpenFAQId] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenFAQId(openFAQId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DynamicTopNav title="FAQs" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center mb-2">
            <HelpCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
            Everything you need to know about our web development process,
            pricing, timelines, and ongoing support.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {faqData.map((faq) => {
            const isOpen = openFAQId === faq.id;

            return (
              <div
                key={faq.id}
                className={`
                  bg-white dark:bg-gray-900
                  border rounded-2xl shadow-sm overflow-hidden
                  transition-all duration-200
                  ${
                    isOpen
                      ? "border-orange-200 dark:border-orange-800/50 shadow-md"
                      : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                  }
                `}
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="
                    w-full px-5 sm:px-6 py-4 sm:py-5
                    flex justify-between items-center gap-4
                    text-left
                    hover:bg-gray-50/80 dark:hover:bg-gray-800/50
                    transition
                  "
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base leading-snug">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`
                      w-5 h-5 shrink-0 text-gray-400 dark:text-gray-500
                      transition-transform duration-200
                      ${isOpen ? "rotate-180 text-orange-500 dark:text-orange-400" : ""}
                    `}
                  />
                </button>

                <div
                  className={`
                    grid transition-all duration-200 ease-in-out
                    ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}
                  `}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800/80">
                      <div className="pt-4">{faq.answer}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-4 pb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Still have questions?
          </p>
          <a
            href="/contact"
            className="
              inline-flex items-center justify-center
              px-6 py-3 rounded-xl
              bg-orange-500 hover:bg-orange-600
              text-white text-sm font-semibold
              shadow-sm shadow-orange-500/20
              transition
            "
          >
            Contact Us
          </a>
        </div>
      </main>
    </div>
  );
}
