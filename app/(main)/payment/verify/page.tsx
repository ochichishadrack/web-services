"use client";

import {
  CheckCircle,
  XCircle,
  Loader2,
  Phone,
  Mail,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { axiosInstance } from "@/utils/axiosInstance";

type Status = "loading" | "success" | "failed";

export default function PaymentVerifyPage() {
  const params = useSearchParams();
  const reference = params.get("reference");

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string>(
    "Verifying secure transaction…",
  );

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setMessage("Missing payment reference.");
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await axiosInstance.get(
          `/api/paystack/verify/${reference}`,
        );
        if (res.data.status === "success") {
          setStatus("success");
          setMessage("Your service order has been confirmed.");
          clearInterval(interval);
        } else if (res.data.status === "failed") {
          setStatus("failed");
          setMessage("We could not confirm your payment.");
          clearInterval(interval);
        }
      } catch {
        setStatus("failed");
        setMessage("We could not confirm your payment.");
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [reference]);

  const supportMessage = encodeURIComponent(
    `Hello MaraSpot support, I need help with my order. Reference: ${reference}`,
  );

  const statusUI = {
    loading: {
      icon: <Loader2 className="h-10 w-10 animate-spin text-orange-600" />,
      title: "Confirming Payment",
      subtitle: "Please wait while we securely verify your transaction.",
      bg: "bg-gray-50 dark:bg-gray-800",
      border: "border-gray-100 dark:border-gray-700",
      text: "text-gray-900 dark:text-gray-100",
      subtitleText: "text-gray-600 dark:text-gray-300",
    },
    success: {
      icon: <CheckCircle className="h-12 w-12 text-green-600" />,
      title: "Payment Confirmed",
      subtitle:
        "Your order is now active. You can track progress from your dashboard.",
      bg: "bg-white dark:bg-gray-900",
      border: "border-gray-100 dark:border-gray-700",
      text: "text-gray-900 dark:text-gray-100",
      subtitleText: "text-gray-600 dark:text-gray-300",
    },
    failed: {
      icon: <XCircle className="h-12 w-12 text-red-600" />,
      title: "Verification Failed",
      subtitle:
        "Your payment could not be confirmed. Please retry or contact support.",
      bg: "bg-white dark:bg-gray-900",
      border: "border-gray-100 dark:border-gray-700",
      text: "text-gray-900 dark:text-gray-100",
      subtitleText: "text-gray-600 dark:text-gray-300",
    },
  }[status];

  return (
    <main className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-4 transition-colors">
      <div className="w-full max-w-lg">
        {/* BRAND */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-orange-600 tracking-tight">
            MaraSpot
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Secure Service Payment Processing
          </p>
        </div>

        {/* STATUS CARD */}
        <div
          className={`rounded-2xl shadow-xl border p-6 text-center ${statusUI.bg} ${statusUI.border}`}
        >
          <div className="flex justify-center">{statusUI.icon}</div>

          <h2 className={`mt-4 text-xl font-bold ${statusUI.text}`}>
            {statusUI.title}
          </h2>

          <p className={`mt-2 text-sm ${statusUI.subtitleText}`}>
            {statusUI.subtitle}
          </p>

          <div className="mt-4 bg-gray-50 dark:bg-gray-800 border rounded-lg px-4 py-2 text-xs text-gray-700 dark:text-gray-300">
            Transaction Reference
            <div className="font-mono font-semibold text-gray-900 dark:text-gray-100 mt-1">
              {reference}
            </div>
          </div>

          {/* TRUST BADGE */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <ShieldCheck size={14} />
            Encrypted & Secure Payment Processing
          </div>

          {/* ACTIONS */}
          {(status === "success" || status === "failed") && (
            <div className="mt-6 flex gap-3">
              {status === "success" && (
                <Link
                  href="/projects"
                  className="flex-1 py-3 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
                >
                  View My Projects
                </Link>
              )}

              {status === "failed" && (
                <Link
                  href="/service-checkout"
                  className="flex-1 py-3 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
                >
                  Retry Payment
                </Link>
              )}

              <Link
                href="/"
                className="flex-1 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Home
              </Link>
            </div>
          )}
        </div>

        {/* SUPPORT */}
        <div className="mt-6 border rounded-2xl p-4 text-center shadow-sm bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-700 transition-colors">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Need help with your order?
          </p>

          <div className="flex gap-3">
            <a
              href={`https://wa.me/254113388120?text=${supportMessage}`}
              target="_blank"
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>

            <a
              href="tel:+254113388120"
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-gray-700 dark:text-gray-200 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <Phone size={14} /> Call
            </a>

            <a
              href={`mailto:maraspot.ke@gmail.com?subject=Order Support&body=${supportMessage}`}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-gray-700 dark:text-gray-200 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <Mail size={14} /> Email
            </a>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 mt-4 transition-colors">
          © {new Date().getFullYear()} MaraSpot
        </p>
      </div>
    </main>
  );
}
