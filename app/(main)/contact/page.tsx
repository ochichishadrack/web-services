"use client";

import { JSX, useState, FormEvent } from "react";
import DynamicTopNav from "@/components/ui/DynamicTopNav";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import { useCustomerAuth } from "@/context/CustomerAuthContext"; // ← adjust path if needed

const WHATSAPP_NUMBER = "254113388120";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hi, I’d like to inquire about your services.",
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;
const CONTACT_EMAIL = "marasot.ke@gmail.com";

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

export default function ContactPage(): JSX.Element {
  const { customer, isAuthenticated, loading: authLoading } = useCustomerAuth();

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const fullName = customer
    ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim()
    : "";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!customer) return;

    setLoading(true);
    setError(null);

    const payload = {
      name: fullName || "Customer",
      email: customer.email,
      message,
      phone: customer.phone_number_primary || undefined,
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DynamicTopNav title="Contact Us" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-8 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Get in Touch
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
            Have a question about services, orders, or pricing? Our team is
            ready to help you.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left — Info */}
          <div className="lg:col-span-2 space-y-4">
            {/* Contact info */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Contact Information
              </h3>

              <div className="space-y-4">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex items-start gap-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Email
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">
                      {CONTACT_EMAIL}
                    </p>
                  </div>
                </a>

                <a
                  href="tel:+254113388120"
                  className="flex items-start gap-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Phone
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">
                      +254 113 388120
                    </p>
                  </div>
                </a>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Location
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      Nairobi, Kenya
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business hours */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Business Hours
                </h3>
              </div>

              <div className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between gap-4">
                  <span>Monday — Friday</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    9:00 AM — 6:00 PM
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Saturday</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    Closed
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Sunday</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    10:00 AM — 4:00 PM
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-7 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Send a Message
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {isAuthenticated
                ? "Your message will be sent using your account details."
                : "Please log in to send a message."}
            </p>

            {authLoading ? (
              <div className="mt-10 text-center text-sm text-gray-500">
                Loading...
              </div>
            ) : !isAuthenticated ? (
              <div className="mt-10 text-center py-8">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  You need to be logged in to send a message.
                </p>
                <a
                  href={`/login?callbackUrl=${encodeURIComponent("/contact")}`}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition"
                >
                  Log in
                </a>
              </div>
            ) : sent ? (
              <div className="mt-10 flex flex-col items-center justify-center text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                </div>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  Message sent successfully
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  We’ll respond as soon as possible.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-5 text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {/* User info preview (read-only) */}
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

                {/* Message only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Message
                  </label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder="How can we help you?"
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
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send as {fullName || "me"}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Floating WhatsApp button */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="
          fixed bottom-6 right-6 z-40
          w-14 h-14 rounded-full
          bg-[#25D366] hover:bg-[#20BD5A]
          text-white
          flex items-center justify-center
          shadow-lg shadow-green-500/30
          transition hover:scale-105
        "
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon className="w-7 h-7" />
      </a>
    </div>
  );
}
