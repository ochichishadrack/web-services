"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DynamicTopNav from "@/components/ui/DynamicTopNav";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { Gift, TicketPercent, Clock } from "lucide-react";

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
    <div className="p-5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 animate-pulse">
      <div className="h-5 w-1/3 bg-gray-200 dark:bg-slate-700 rounded mb-3" />
      <div className="h-4 w-1/2 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
      <div className="h-4 w-1/4 bg-gray-200 dark:bg-slate-700 rounded" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="mx-auto w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mb-4">
        <Gift className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        No vouchers yet
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        When you receive credits or promo vouchers, they’ll appear here.
      </p>
    </div>
  );
}

export default function VouchersPage() {
  const { customer, loading: authLoading } = useCustomerAuth();
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !customer) {
      router.replace("/user/login");
    }
  }, [authLoading, customer, router]);

  useEffect(() => {
    if (!customer) return;

    const fetchVouchers = async () => {
      try {
        const res = await fetch("/api/vouchers", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setVouchers(data || []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, [customer]);

  if (authLoading || !customer) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-pulse" />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <DynamicTopNav title="Vouchers & Credits" />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Your Benefits
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage promo codes, discounts, and service credits.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : vouchers.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {vouchers.map((voucher) => {
              const isActive = voucher.status === "active";

              return (
                <div
                  key={voucher.id}
                  className="p-5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                      <TicketPercent className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {voucher.code}
                      </p>

                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {voucher.type === "percentage"
                          ? `${voucher.discount}% discount`
                          : `KES ${voucher.discount} credit`}
                      </p>

                      {voucher.expires_at && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <Clock className="w-3 h-3" />
                          Expires{" "}
                          {new Date(voucher.expires_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                        : voucher.status === "used"
                          ? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                    }`}
                  >
                    {voucher.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
