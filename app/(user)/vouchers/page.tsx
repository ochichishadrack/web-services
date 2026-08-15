"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import DynamicTopNav from "@/components/ui/DynamicTopNav";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { Gift, TicketPercent, Clock, Copy, Check } from "lucide-react";

interface Voucher {
  id: string;
  code: string;
  discount: number;
  type: "percentage" | "fixed";
  expires_at?: string;
  status: "active" | "used" | "expired";
}

function SkeletonCard() {
  return (
    <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-800" />
        <div className="flex-1 space-y-2.5">
          <div className="h-5 w-1/3 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-3 w-1/4 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
        <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 sm:py-20 px-4">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center mb-5">
        <Gift className="w-8 h-8 text-orange-500 dark:text-orange-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        No vouchers yet
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
        When you receive credits or promo vouchers, they’ll appear here.
      </p>
    </div>
  );
}

function VoucherCard({ voucher }: { voucher: Voucher }) {
  const [copied, setCopied] = useState(false);
  const isActive = voucher.status === "active";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(voucher.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback ignored
    }
  };

  const statusStyles = {
    active:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    used: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    expired: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <div
      className={`
        p-5 rounded-2xl border bg-white dark:bg-gray-900 shadow-sm
        transition hover:shadow-md
        ${
          isActive
            ? "border-orange-200 dark:border-orange-800/40 hover:border-orange-300 dark:hover:border-orange-700/50"
            : "border-gray-200 dark:border-gray-800"
        }
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div
            className={`
              w-12 h-12 rounded-xl flex items-center justify-center shrink-0
              ${
                isActive
                  ? "bg-orange-50 dark:bg-orange-900/30"
                  : "bg-gray-100 dark:bg-gray-800"
              }
            `}
          >
            <TicketPercent
              className={`w-6 h-6 ${
                isActive
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-900 dark:text-white font-mono tracking-wide">
                {voucher.code}
              </p>
              {isActive && (
                <button
                  onClick={handleCopy}
                  className="p-1 rounded-md text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
                  aria-label="Copy code"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {voucher.type === "percentage"
                ? `${voucher.discount}% discount`
                : `KES ${voucher.discount.toLocaleString()} credit`}
            </p>

            {voucher.expires_at && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mt-2">
                <Clock className="w-3.5 h-3.5" />
                Expires{" "}
                {new Date(voucher.expires_at).toLocaleDateString("en-KE", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            )}
          </div>
        </div>

        <span
          className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusStyles[voucher.status]}`}
        >
          {voucher.status}
        </span>
      </div>
    </div>
  );
}

export default function VouchersPage() {
  const { customer, loading: authLoading, isAuthenticated } = useCustomerAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const callbackUrl = encodeURIComponent(pathname || "/vouchers");
      router.replace(`/login?callbackUrl=${callbackUrl}`);
    }
  }, [authLoading, isAuthenticated, router, pathname]);

  useEffect(() => {
    if (!customer) return;

    const fetchVouchers = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/vouchers", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setVouchers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch vouchers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, [customer]);

  if (authLoading || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <DynamicTopNav title="Vouchers & Credits" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-4 animate-pulse">
          <div className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-800" />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DynamicTopNav title="Vouchers & Credits" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Your Benefits
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage promo codes, discounts, and service credits.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : vouchers.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <EmptyState />
          </div>
        ) : (
          <div className="space-y-3">
            {vouchers.map((voucher) => (
              <VoucherCard key={voucher.id} voucher={voucher} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
