"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AlertTriangle, Loader2, ArrowRight } from "lucide-react";
import { getApiBaseUrl } from "@/api/api";

const labelCls =
  "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200";

const inputCls =
  "h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500";

export default function CompletePhonePage() {
  const router = useRouter();
  const API_BASE_URL = getApiBaseUrl();

  const [phonePrimary, setPhonePrimary] = useState("");
  const [phoneSecondary, setPhoneSecondary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitPhone = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!phonePrimary.trim()) {
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
    <main className="flex min-h-[100dvh] items-center justify-center bg-white px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))] text-gray-900 transition-colors sm:px-6 dark:bg-[#1f2228] dark:text-white">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div className="mb-3 flex justify-center">
            <Image
              src="/icons/icon-192.png"
              alt="Maraspot"
              width={48}
              height={48}
              priority
              className="h-12 w-12 rounded-xl"
            />
          </div>

          <h1 className="text-2xl font-bold sm:text-3xl">
            Complete your profile
          </h1>
          <p className="mt-2 text-sm text-gray-500 sm:text-base dark:text-gray-400">
            Add your phone number so we can reach you about your projects.
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0">
              <p className="font-medium">Submission failed</p>
              <p className="break-words">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={submitPhone} noValidate className="space-y-5">
          {/* Primary phone */}
          <div>
            <label htmlFor="phonePrimary" className={labelCls}>
              Primary phone number
            </label>
            <input
              id="phonePrimary"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="e.g. +254712345678"
              value={phonePrimary}
              onChange={(e) => setPhonePrimary(e.target.value)}
              disabled={loading}
              className={inputCls}
            />
          </div>

          {/* Secondary phone */}
          <div>
            <label htmlFor="phoneSecondary" className={labelCls}>
              Secondary phone number{" "}
              <span className="font-normal text-gray-400 dark:text-gray-500">
                (optional)
              </span>
            </label>
            <input
              id="phoneSecondary"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="e.g. +254798765432"
              value={phoneSecondary}
              onChange={(e) => setPhoneSecondary(e.target.value)}
              disabled={loading}
              className={inputCls}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-[#1f2228]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Continue
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
