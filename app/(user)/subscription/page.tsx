"use client";

import { useEffect, useState } from "react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { getApiBaseUrl } from "@/api/api";
import DynamicTopNav from "@/components/ui/DynamicTopNav";
import { useRouter, usePathname } from "next/navigation";
import { Mail, CheckCircle2, XCircle, Shield, FileText } from "lucide-react";

export default function NewsletterPreferencesPage() {
  const { customer, isAuthenticated, loading: authLoading } = useCustomerAuth();
  const customerId = customer?.public_id;
  const router = useRouter();
  const pathname = usePathname();

  const [email, setEmail] = useState("");
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const INTEREST_TYPE = "services";
  const SOURCE_APP = "services_web";

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const callbackUrl = encodeURIComponent(pathname || "/newsletter");
      router.replace(`/login?callbackUrl=${callbackUrl}`);
      return;
    }

    if (!customerId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const resCustomer = await fetch(
          `${getApiBaseUrl()}/api/customers/${customerId}`,
        );
        if (resCustomer.ok) {
          const data = await resCustomer.json();
          setEmail(data.email);
        }

        const resSub = await fetch(
          `${getApiBaseUrl()}/api/subscription/subscribe/${customerId}`,
        );
        if (resSub.ok) {
          const subscriptions = await resSub.json();
          const serviceSub = subscriptions.find(
            (s: { interest_type: string }) => s.interest_type === INTEREST_TYPE,
          );

          if (serviceSub) {
            setAcceptedPrivacy(serviceSub.accepted_privacy);
            setAcceptedTerms(serviceSub.accepted_terms);
            setSubscribed(serviceSub.is_subscribed);
          }
        }
      } catch (err) {
        console.error("Failed to fetch preferences", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, isAuthenticated, customerId, router, pathname]);

  const handleSubmit = async (isSubscribing: boolean) => {
    if (!acceptedPrivacy || !acceptedTerms) {
      setStatus("error");
      return;
    }

    try {
      setSubmitting(true);
      setStatus("idle");

      const res = await fetch(`${getApiBaseUrl()}/api/subscription/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          customer_id: customerId,
          interest_type: INTEREST_TYPE,
          source_app: SOURCE_APP,
          is_subscribed: isSubscribing,
          accepted_privacy: acceptedPrivacy,
          accepted_terms: acceptedTerms,
        }),
      });

      if (res.ok) {
        setSubscribed(isSubscribing);
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <DynamicTopNav title="Newsletter" />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-pulse space-y-6">
          <div className="h-36 rounded-2xl bg-gray-200 dark:bg-gray-800" />
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-5">
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="h-5 w-64 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-5 w-56 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded-xl mt-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DynamicTopNav title="Newsletter" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 sm:p-8 text-white shadow-sm">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">
                  Service Updates & Insights
                </h1>
              </div>
            </div>
            <p className="text-orange-50/90 text-sm sm:text-base max-w-md leading-relaxed">
              Get exclusive offers, product updates, and professional insights
              delivered straight to your inbox.
            </p>
          </div>

          {/* subtle decorative circle */}
          <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute right-12 -top-6 w-24 h-24 rounded-full bg-white/5" />
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
          {/* Status header */}
          <div className="px-6 sm:px-8 pt-6 pb-5 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Subscription Status
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage your service-related email preferences.
              </p>
            </div>

            <span
              className={`
                shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                ${
                  subscribed
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }
              `}
            >
              {subscribed ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <XCircle className="w-3.5 h-3.5" />
              )}
              {subscribed ? "Subscribed" : "Not Subscribed"}
            </span>
          </div>

          <div className="p-6 sm:px-8 sm:py-7 space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                readOnly
                className="
                  w-full px-4 py-3 rounded-xl
                  bg-gray-50 dark:bg-gray-950
                  border border-gray-200 dark:border-gray-700
                  text-gray-700 dark:text-gray-300
                  cursor-not-allowed
                "
              />
              <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                This is the email linked to your account.
              </p>
            </div>

            {/* Agreements */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Required agreements
              </p>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={acceptedPrivacy}
                  onChange={() => setAcceptedPrivacy(!acceptedPrivacy)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500/40 accent-orange-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-orange-500 shrink-0" />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      Privacy Policy
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    I agree to the Privacy Policy and how my data is used.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={() => setAcceptedTerms(!acceptedTerms)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500/40 accent-orange-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-500 shrink-0" />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      Legal Terms
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    I accept the Legal Terms and Conditions.
                  </p>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="pt-1">
              {!subscribed ? (
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={submitting || !acceptedPrivacy || !acceptedTerms}
                  className={`
                    w-full py-3.5 rounded-xl font-semibold text-sm transition
                    ${
                      submitting || !acceptedPrivacy || !acceptedTerms
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                        : "bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20"
                    }
                  `}
                >
                  {submitting ? "Subscribing..." : "Subscribe to Newsletter"}
                </button>
              ) : (
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="
                    w-full py-3.5 rounded-xl font-semibold text-sm transition
                    bg-red-50 dark:bg-red-900/20
                    border border-red-200 dark:border-red-800/50
                    text-red-600 dark:text-red-400
                    hover:bg-red-100 dark:hover:bg-red-900/30
                    disabled:opacity-60 disabled:cursor-not-allowed
                  "
                >
                  {submitting ? "Unsubscribing..." : "Unsubscribe"}
                </button>
              )}
            </div>

            {/* Feedback */}
            {status === "success" && (
              <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Preferences updated successfully.
              </div>
            )}
            {status === "error" && (
              <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium">
                <XCircle className="w-4 h-4" />
                {!acceptedPrivacy || !acceptedTerms
                  ? "Please accept the privacy policy and legal terms."
                  : "Something went wrong. Please try again."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
