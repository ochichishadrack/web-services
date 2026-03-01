"use client";

import { useEffect, useState, FormEvent } from "react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { getApiBaseUrl } from "@/api/api";
import DynamicTopNav from "../../../components/ui/DynamicTopNav";
import { useRouter } from "next/navigation";

export default function NewsletterPreferencesPage() {
  const { customer, isAuthenticated, loading: authLoading } = useCustomerAuth();
  const customerId = customer?.public_id; // ✅ fix
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);

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
          const subData = await resSub.json();
          setAcceptedPrivacy(subData.accepted_privacy);
          setAcceptedTerms(subData.accepted_terms);
          setSubscribed(subData.wants_newsletter);
        } else {
          setSubscribed(false);
        }
      } catch (err) {
        console.error("Failed to fetch customer or subscription", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, isAuthenticated, customerId, router]);

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!acceptedPrivacy || !acceptedTerms) {
      return alert("Please accept the privacy policy and legal terms.");
    }
    if (!customerId) return;

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/subscription/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          customer_id: customerId,
          wants_newsletter: true,
          accepted_privacy: acceptedPrivacy,
          accepted_terms: acceptedTerms,
        }),
      });

      if (res.ok) {
        setSubscribed(true);
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const handleUnsubscribe = async () => {
    if (!confirm("Are you sure you want to unsubscribe from newsletters?"))
      return;
    if (!customerId) return;

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/subscription/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          customer_id: customerId,
          wants_newsletter: false,
          accepted_privacy: acceptedPrivacy,
          accepted_terms: acceptedTerms,
        }),
      });

      if (res.ok) {
        setSubscribed(false);
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 text-lg">Loading your preferences...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 w-full z-50">
        <DynamicTopNav title="Newsletter Preferences" />
      </div>

      <div className="pt-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Header */}
        <div className="bg-linear-to-r from-purple-400 to-pink-400 text-white p-6 rounded-2xl shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold">Stay in the loop!</h1>
          <p className="mt-1 text-sm sm:text-base opacity-90">
            Customize how you receive updates and newsletters.
          </p>
        </div>

        {/* Subscription Status */}
        {subscribed ? (
          <div className="flex items-center justify-between bg-green-100 text-green-800 p-4 rounded-lg shadow">
            <span>You are currently subscribed to our newsletters.</span>
            <button
              onClick={handleUnsubscribe}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition text-sm"
            >
              Unsubscribe
            </button>
          </div>
        ) : (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow">
            <p className="text-yellow-800">
              You are not subscribed yet. Subscribe now to receive our latest
              updates and news!
            </p>
          </div>
        )}

        {/* Subscription Form */}
        {!subscribed && (
          <form
            className="space-y-6 bg-white p-6 rounded-2xl shadow-md"
            onSubmit={handleSubscribe}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full border-gray-300 rounded-lg shadow-sm p-3 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="privacy"
                  checked={acceptedPrivacy}
                  onChange={() => setAcceptedPrivacy(!acceptedPrivacy)}
                  className="mt-1 accent-orange-500 w-4 h-4"
                />
                <label htmlFor="privacy" className="text-sm text-gray-700">
                  I agree to TopNotch&apos;s{" "}
                  <a href="#" className="text-orange-500 underline">
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={() => setAcceptedTerms(!acceptedTerms)}
                  className="mt-1 accent-orange-500 w-4 h-4"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I accept the{" "}
                  <a href="#" className="text-orange-500 underline">
                    Legal Terms
                  </a>
                  .
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg shadow-md transition"
            >
              Subscribe
            </button>
          </form>
        )}

        {status === "success" && (
          <p className="text-green-600 text-sm text-center mt-2">
            Preferences updated!
          </p>
        )}
        {status === "error" && (
          <p className="text-red-600 text-sm text-center mt-2">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
