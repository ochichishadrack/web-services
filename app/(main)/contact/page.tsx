"use client";

import { JSX, useState, FormEvent } from "react";
import DynamicTopNav from "@/components/ui/DynamicTopNav";
import {
  Send,
  CheckCircle2,
  Loader2,
  MessageSquare,
  FileText,
  LifeBuoy,
} from "lucide-react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

const WHATSAPP_NUMBER = "254113388120";
const CONTACT_EMAIL = "maraspot.ke@gmail.com";

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

const INQUIRY_TYPES = [
  {
    id: "inquiry",
    label: "General inquiry",
    icon: MessageSquare,
    description: "Questions about services or process",
  },
  {
    id: "quote",
    label: "Request a quote",
    icon: FileText,
    description: "Get pricing for a project",
  },
  {
    id: "support",
    label: "Support",
    icon: LifeBuoy,
    description: "Help with an existing project or order",
  },
] as const;

type InquiryType = (typeof INQUIRY_TYPES)[number]["id"];

export default function ContactPage(): JSX.Element {
  const { customer, isAuthenticated, loading: authLoading } = useCustomerAuth();

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [inquiryType, setInquiryType] = useState<InquiryType>("inquiry");

  const fullName = customer
    ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim()
    : "";

  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi, I’d like to inquire about your services.",
  )}`;

  async function sendMessage() {
    if (!customer) return;

    setLoading(true);
    setError(null);

    const typeLabel =
      INQUIRY_TYPES.find((t) => t.id === inquiryType)?.label ?? "Inquiry";

    const payload = {
      name: fullName || "Customer",
      email: customer.email,
      message: `[${typeLabel}]\n\n${message}`,
      phone: customer.phone_number_primary || undefined,
      subject: typeLabel,
      type: inquiryType,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to send message");
      }

      setSent(true);
      setMessage("");
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
    await sendMessage();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DynamicTopNav title="Contact" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            How can we help?
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            Reach out for a project inquiry, a tailored quote, or support on an
            existing engagement. We typically respond within one business day.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-8 shadow-sm">
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
                Sign in to send an inquiry, request a quote, or get support.
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
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                Message sent successfully
              </p>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                We’ll reply to {customer?.email} as soon as possible.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-6 text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Inquiry type */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  What do you need?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {INQUIRY_TYPES.map((type) => {
                    const Icon = type.icon;
                    const selected = inquiryType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setInquiryType(type.id)}
                        className={`
                          flex flex-col items-start gap-1.5 rounded-xl border px-3.5 py-3 text-left transition
                          ${
                            selected
                              ? "border-orange-400 bg-orange-50 ring-2 ring-orange-400/20 dark:border-orange-500/60 dark:bg-orange-500/10 dark:ring-orange-500/20"
                              : "border-gray-200 bg-gray-50/80 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800/40 dark:hover:border-gray-600"
                          }
                        `}
                      >
                        <Icon
                          className={`w-4 h-4 ${selected ? "text-orange-600 dark:text-orange-400" : "text-gray-400"}`}
                        />
                        <span
                          className={`text-sm font-semibold ${selected ? "text-orange-700 dark:text-orange-300" : "text-gray-800 dark:text-gray-200"}`}
                        >
                          {type.label}
                        </span>
                        <span className="text-[11px] leading-snug text-gray-500 dark:text-gray-400">
                          {type.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sending as */}
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 px-4 py-3 text-sm">
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                  Sending as
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

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Message
                </label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder={
                    inquiryType === "quote"
                      ? "Describe your project, timeline, and any requirements…"
                      : inquiryType === "support"
                        ? "Describe the issue or what you need help with…"
                        : "How can we help you?"
                  }
                  className="
                    w-full px-4 py-3 rounded-xl
                    border border-gray-200 dark:border-gray-700
                    bg-white dark:bg-gray-950
                    text-gray-900 dark:text-white
                    placeholder:text-gray-400
                    focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500
                    transition resize-none
                  "
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !message.trim()}
                className={`
                  w-full py-3.5 rounded-xl font-semibold text-sm
                  flex items-center justify-center gap-2
                  transition
                  ${
                    loading || !message.trim()
                      ? "bg-orange-300 dark:bg-orange-800/50 text-white cursor-not-allowed"
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
                    {inquiryType === "quote"
                      ? "Request quote"
                      : inquiryType === "support"
                        ? "Submit support request"
                        : "Send inquiry"}
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                Or email{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-orange-600 dark:text-orange-400 hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Floating WhatsApp — smaller + labeled */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="Chat with us on WhatsApp"
        className="
          fixed bottom-5 right-5 z-40
          inline-flex items-center gap-2
          pl-3 pr-3.5 py-2.5
          rounded-full
          bg-[#25D366] hover:bg-[#20BD5A]
          text-white
          shadow-lg shadow-green-500/25
          transition hover:scale-[1.03]
        "
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon className="w-5 h-5 shrink-0" />
        <span className="text-xs font-semibold tracking-wide pr-0.5">
          Chat on WhatsApp
        </span>
      </a>
    </div>
  );
}
