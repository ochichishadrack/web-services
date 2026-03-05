"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getApiBaseUrl } from "@/api/api";

export default function CompletePhonePage() {
  const router = useRouter();
  const API_BASE_URL = getApiBaseUrl();

  const [phonePrimary, setPhonePrimary] = useState("");
  const [phoneSecondary, setPhoneSecondary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitPhone = async () => {
    if (!phonePrimary) {
      setError("Primary phone number is required");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/complete-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          phone_number_primary: phonePrimary,
          phone_number_secondary: phoneSecondary || null,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Server error:", text);
        setError("Failed to save phone number");
        return;
      }

      const result = await res.json();
      router.push(result.redirect || "/account");
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-2">
            <Image
              src="/icons/icon-192.png"
              alt="Maraspot"
              width={56}
              height={56}
              priority
            />
          </div>

          <h1 className="text-xl font-semibold tracking-tight text-gray-900">
            Maraspot
          </h1>

          <p className="text-sm text-gray-500 mt-1">Complete your profile</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
          {/* Error Alert */}
          {error && (
            <div
              role="alert"
              className="flex gap-3 items-start rounded-lg border border-red-200 
              bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              <span className="mt-0.5 text-red-500">⚠</span>
              <div>
                <p className="font-medium">Submission failed</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Primary Phone */}
          <div className="relative">
            <input
              value={phonePrimary}
              onChange={(e) => setPhonePrimary(e.target.value)}
              placeholder=" "
              className="peer w-full text-gray-900 rounded-md border border-gray-300 
              px-3 pt-5 pb-2 text-sm focus:ring-2 focus:ring-orange-500 
              focus:border-orange-500 outline-none"
            />
            <label
              className="absolute left-3 top-2.5 text-xs text-gray-500 transition-all
              peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm
              peer-focus:top-2.5 peer-focus:text-xs"
            >
              Primary phone number
            </label>
          </div>

          {/* Secondary Phone */}
          <div className="relative">
            <input
              value={phoneSecondary}
              onChange={(e) => setPhoneSecondary(e.target.value)}
              placeholder=" "
              className="peer w-full text-gray-900 rounded-md border border-gray-300 
              px-3 pt-5 pb-2 text-sm focus:ring-2 focus:ring-orange-500 
              focus:border-orange-500 outline-none"
            />
            <label
              className="absolute left-3 top-2.5 text-xs text-gray-500 transition-all
              peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm
              peer-focus:top-2.5 peer-focus:text-xs"
            >
              Secondary phone number (optional)
            </label>
          </div>

          {/* Submit Button */}
          <button
            onClick={submitPhone}
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 
            text-white font-medium py-2 rounded-md transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
