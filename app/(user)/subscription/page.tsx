"use client";

import { useEffect, useState, FormEvent } from "react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { getApiBaseUrl } from "@/api/api";
import DynamicTopNav from "../../../components/ui/DynamicTopNav";
import { useRouter } from "next/navigation";

export default function NewsletterPreferencesPage() {
  const { customer, isAuthenticated, loading: authLoading } = useCustomerAuth();
  const customerId = customer?.public_id;
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);

  const INTEREST_TYPE = "services";
  const SOURCE_APP = "services_web";

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/user/login?callbackUrl=/user/newsletter");
      return;
    }

    if (!customerId) return;

    const fetchData = async () => {
      try {
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
            (s: any) => s.interest_type === INTEREST_TYPE,
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
  }, [authLoading, isAuthenticated, customerId, router]);

  const handleSubmit = async (isSubscribing: boolean) => {
    if (!acceptedPrivacy || !acceptedTerms) {
      alert("Please accept the privacy policy and legal terms.");
      return;
    }

    try {
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
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 dark:text-gray-300 text-lg">
          Loading your preferences...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="fixed top-0 left-0 w-full z-50">
        <DynamicTopNav title="Newsletter Subscription" />
      </div>

      <div className="pt-20 max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Hero Section */}
        <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-3xl shadow-xl">
          <h1 className="text-3xl font-bold mb-2">
            Service Updates & Insights
          </h1>
          <p className="opacity-90 text-sm md:text-base">
            Receive exclusive service offers, updates, and professional insights
            directly to your inbox.
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 space-y-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Subscription Status
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your service-related email preferences.
              </p>
            </div>

            <span
              className={`px-4 py-1 rounded-full text-xs font-medium ${
                subscribed
                  ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {subscribed ? "Subscribed" : "Not Subscribed"}
            </span>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full border rounded-lg p-3 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-4">
            <label className="flex items-start space-x-3 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={() => setAcceptedPrivacy(!acceptedPrivacy)}
                className="mt-1 accent-indigo-600"
              />
              <span>I agree to the Privacy Policy.</span>
            </label>

            <label className="flex items-start space-x-3 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={() => setAcceptedTerms(!acceptedTerms)}
                className="mt-1 accent-indigo-600"
              />
              <span>I accept the Legal Terms.</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            {!subscribed ? (
              <button
                onClick={() => handleSubmit(true)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition"
              >
                Subscribe
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(false)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-xl transition"
              >
                Unsubscribe
              </button>
            )}
          </div>

          {status === "success" && (
            <p className="text-green-600 dark:text-green-400 text-sm text-center">
              Preferences updated successfully.
            </p>
          )}
          {status === "error" && (
            <p className="text-red-600 dark:text-red-400 text-sm text-center">
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
