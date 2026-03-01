"use client";

import { useState } from "react";
import DynamicTopNav from "@/components/ui/DynamicTopNav";
import { ChevronDown, ChevronUp } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <DynamicTopNav title="FAQs" />

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Everything you need to know about our web development process,
            pricing, timelines, and ongoing support.
          </p>
        </div>

        <div className="space-y-4 mt-8">
          {faqData.map((faq) => {
            const isOpen = openFAQId === faq.id;

            return (
              <div
                key={faq.id}
                className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden transition"
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
