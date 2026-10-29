"use client";

import { JSX, useState, FormEvent } from "react";
import DynamicTopNav from "@/components/ui/DynamicTopNav";
import {
  Send,
  CheckCircle2,
  Loader2,
  Mail,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

const WHATSAPP_NUMBER = "254113388120";
const CONTACT_EMAIL = "maraspot.ke@gmail.com";

const BUDGET_OPTIONS = [
  "Under KES 50,000",
  "KES 50,000 – 150,000",
  "KES 150,000 – 500,000",
  "KES 500,000+",
  "Not sure yet",
] as const;

const TIMELINE_OPTIONS = [
  "As soon as possible",
  "Within 1 month",
  "1 – 3 months",
  "Flexible",
] as const;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.139-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function ChipGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2.5">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(selected ? "" : option)}
              aria-pressed={selected}
              className={`
                px-3.5 py-2 rounded-full border text-xs sm:text-sm font-medium transition
                ${
                  selected
                    ? "border-orange-400 bg-orange-50 text-orange-700 ring-2 ring-orange-400/20 dark:border-orange-500/60 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/20"
                    : "border-gray-200 bg-gray-50/80 text-gray-600 hover:border-gray-300 dark:border-[#3d434d] dark:bg-[#1f2228] dark:text-gray-300 dark:hover:border-[#4a515c] dark:hover:bg-[#2e333c]"
                }
              `}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ContactPage(): JSX.Element {
  const { customer, isAuthenticated, loading: authLoading } = useCustomerAuth();

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [projectTitle, setProjectTitle] = useState("");
  const [message, setMessage] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");

  const fullName = customer
    ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim()
    : "";

  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi, I’d like to get a quote for a project.",
  )}`;

  async function sendQuote() {
    if (!customer) return;

    setLoading(true);
    setError(null);

    const details = [
      `Project: ${projectTitle.trim()}`,
      `Budget: ${budget || "Not specified"}`,
      `Timeline: ${timeline || "Not specified"}`,
      "",
      "Project details:",
      message.trim(),
    ].join("\n");

    const payload = {
      name: fullName || "Customer",
      email: customer.email,
      message: `[Quote request]\n\n${details}`,
      phone: customer.phone_number_primary || undefined,
      subject: `Quote request: ${projectTitle.trim()}`,
      type: "quote",
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to send quote request");
      }

      setSent(true);
      setProjectTitle("");
      setMessage("");
      setBudget("");
      setTimeline("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!customer) return;
    await sendQuote();
  }

  const canSubmit = !loading && projectTitle.trim() && message.trim();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1f2228]">
      <DynamicTopNav title="Request a Quote" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-28 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 dark:bg-orange-500/15 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
            <Clock className="w-3.5 h-3.5" />
            Quotes within one business day
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Request a quote
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            Tell us about your project and we’ll send you a tailored,
            no-obligation quote.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white dark:bg-[#272b33] border border-gray-200 dark:border-[#343942] rounded-2xl p-5 sm:p-8 shadow-sm dark:shadow-black/20">
          {authLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading…
              </p>
            </div>
          ) : !isAuthenticated ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-xs mx-auto">
                Sign in to request a quote for your project.
              </p>
              <a
                href={`/login?callbackUrl=${encodeURIComponent("/contact")}`}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition"
              >
                Sign in
              </a>
            </div>
          ) : sent ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                Quote request received
              </p>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                We’ll review your project and send your quote to{" "}
                {customer?.email} within one business day.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-6 text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline"
              >
                Request another quote
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sending as */}
              <div className="rounded-xl bg-gray-50 dark:bg-[#1f2228] border border-gray-100 dark:border-[#343942] px-4 py-3 text-sm">
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                  Quote will be sent to
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {fullName || "Customer"}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  {customer?.email}
                </p>
                {customer?.phone_number_primary && (
                  <p className="text-gray-600 dark:text-gray-300">
                    {customer.phone_number_primary}
                  </p>
                )}
              </div>

              {/* Project title */}
              <div>
                <label
                  htmlFor="project-title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Project title <span className="text-orange-500">*</span>
                </label>
                <input
                  id="project-title"
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. E-commerce website for my business"
                  className="
                    w-full px-4 py-3 rounded-xl
                    border border-gray-200 dark:border-[#3d434d]
                    bg-white dark:bg-[#1f2228]
                    text-gray-900 dark:text-white
                    placeholder:text-gray-400 dark:placeholder:text-gray-500
                    focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500
                    transition
                  "
                />
              </div>

              {/* Project details */}
              <div>
                <label
                  htmlFor="project-details"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Project details <span className="text-orange-500">*</span>
                </label>
                <textarea
                  id="project-details"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Describe what you need, key features, goals, and any requirements or references…"
                  className="
                    w-full px-4 py-3 rounded-xl
                    border border-gray-200 dark:border-[#3d434d]
                    bg-white dark:bg-[#1f2228]
                    text-gray-900 dark:text-white
                    placeholder:text-gray-400 dark:placeholder:text-gray-500
                    focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500
                    transition resize-none
                  "
                />
              </div>

              {/* Budget */}
              <ChipGroup
                label="Estimated budget"
                options={BUDGET_OPTIONS}
                value={budget}
                onChange={setBudget}
              />

              {/* Timeline */}
              <ChipGroup
                label="Preferred timeline"
                options={TIMELINE_OPTIONS}
                value={timeline}
                onChange={setTimeline}
              />

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className={`
                  w-full py-3.5 rounded-xl font-semibold text-sm
                  flex items-center justify-center gap-2
                  transition
                  ${
                    !canSubmit
                      ? "bg-orange-300 dark:bg-orange-500/30 text-white dark:text-orange-100/70 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20"
                  }
                `}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Request quote
                  </>
                )}
              </button>

              <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                <ShieldCheck className="w-3.5 h-3.5" />
                Your details are kept private and used only to prepare your
                quote.
              </p>
            </form>
          )}
        </div>

        {/* Help footer */}
        <div className="rounded-2xl border border-gray-200 dark:border-[#343942] bg-white/60 dark:bg-[#272b33]/60 px-5 py-5 text-center">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Need help?
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Prefer to talk it through? Email us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-orange-600 dark:text-orange-400 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            or message us directly on WhatsApp.
          </p>

          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5">
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Quote inquiry")}`}
              className="
                inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                border border-gray-200 dark:border-[#3d434d]
                bg-white dark:bg-[#272b33]
                text-sm font-medium text-gray-700 dark:text-gray-200
                hover:bg-gray-50 dark:hover:bg-[#2e333c]
                transition
              "
            >
              <Mail className="w-4 h-4" />
              Email us
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                bg-[#25D366]/10 border border-[#25D366]/30
                text-sm font-medium text-[#1a9f4c] dark:text-[#4ade80]
                hover:bg-[#25D366]/20
                transition
              "
            >
              <WhatsAppIcon className="w-4 h-4" />
              Message on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp — icon only */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="Chat with us on WhatsApp"
        aria-label="Chat on WhatsApp"
        className="
          fixed bottom-5 right-5 z-40
          flex items-center justify-center
          w-12 h-12 rounded-full
          bg-[#25D366] hover:bg-[#20BD5A]
          text-white
          shadow-lg shadow-green-500/25 dark:shadow-black/40
          transition hover:scale-105
        "
      >
        <WhatsAppIcon className="w-6 h-6" />
      </a>
    </div>
  );
}
