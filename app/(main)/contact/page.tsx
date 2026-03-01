"use client";

import { JSX, useState } from "react";
import DynamicTopNav from "@/components/ui/DynamicTopNav";

export default function ContactPage(): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    // TODO: connect to your API
    await new Promise((r) => setTimeout(r, 1200));

    setLoading(false);
    setSent(true);
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <DynamicTopNav title="Contact Us" />

      {/* HERO */}
      <section className="px-6 py-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Get in Touch
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          Have a question about services, orders, or pricing? Our team is ready
          to help you.
        </p>
      </section>

      {/* CONTENT GRID */}
      <section className="px-6 pb-16 max-w-6xl mx-auto grid gap-8 lg:grid-cols-2">
        {/* CONTACT INFO */}
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Contact Information
            </h3>

            <div className="mt-4 space-y-4 text-gray-600 dark:text-gray-400">
              <p>
                <span className="font-medium text-gray-900 dark:text-gray-200">
                  Email:
                </span>{" "}
                support@maraspot.co.ke
              </p>

              <p>
                <span className="font-medium text-gray-900 dark:text-gray-200">
                  Phone:
                </span>{" "}
                +254 113 388120
              </p>

              <p>
                <span className="font-medium text-gray-900 dark:text-gray-200">
                  Location:
                </span>{" "}
                Nairobi, Kenya
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Business Hours
            </h3>

            <div className="mt-4 space-y-2 text-gray-600 dark:text-gray-400">
              <p>Monday — Friday: 9:00 AM — 6:00 PM</p>
              <p>Saturday: Closed</p>
              <p>Sunday: 10:00 AM — 4:00 PM</p>
            </div>
          </div>
        </div>

        {/* CONTACT FORM */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Send a Message
          </h3>

          {sent ? (
            <div className="mt-6 text-center text-green-600 dark:text-green-400 font-medium">
              ✅ Your message has been sent successfully.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                required
                placeholder="Full Name"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                required
                type="email"
                placeholder="Email Address"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <textarea
                required
                rows={5}
                placeholder="Your Message"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                disabled={loading}
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
