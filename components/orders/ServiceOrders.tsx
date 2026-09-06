'use client';

import { JSX, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { axiosInstance } from '@/utils/axiosInstance';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocalCurrency } from '@/hooks/useLocalCurrency';

interface ServiceOrder {
  id: string;
  service_title: string;
  package_type: string;
  total_price: number; // USD from DB
  status:
    | 'pending'
    | 'paid'
    | 'delivered'
    | 'completed'
    | 'cancelled'
    | 'disputed'
    | 'phase_1_in_progress'
    | 'phase_1_completed'
    | 'phase_2_in_progress'
    | 'phase_2_completed'
    | 'phase_3_in_progress'
    | 'phase_3_completed';
  due_date: string | null;
  created_at: string;
}

const statusConfig: Record<ServiceOrder['status'], { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
  },
  paid: {
    label: 'Paid',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
  disputed: {
    label: 'Disputed',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  },
  phase_1_in_progress: {
    label: 'Phase 1 In Progress',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  phase_1_completed: {
    label: 'Phase 1 Completed',
    className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  },
  phase_2_in_progress: {
    label: 'Phase 2 In Progress',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  phase_2_completed: {
    label: 'Phase 2 Completed',
    className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  },
  phase_3_in_progress: {
    label: 'Phase 3 In Progress',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  phase_3_completed: {
    label: 'Phase 3 Completed',
    className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  },
};

/* ---------------- Skeleton ---------------- */
function OrdersSkeleton(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>

        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="h-5 w-3/5 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded-full" />
              </div>

              <div className="flex justify-between items-center">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="h-3 w-40 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Page ---------------- */
export default function ServiceOrders(): JSX.Element {
  const { customer, loading: authLoading, isAuthenticated } = useCustomerAuth();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const router = useRouter();
  const buyerId = customer?.public_id ?? null;

  // ---------- Currency ----------
  const { currency: localCurrency, convert, format, loading: currencyLoading } = useLocalCurrency();

  const payCurrency: 'KES' | 'USD' = localCurrency === 'KES' ? 'KES' : 'USD';
  const isKes = payCurrency === 'KES';
  const showLocalEstimate = !currencyLoading && localCurrency !== payCurrency;

  const formatMoney = (usdAmount: number) => {
    const amount = isKes ? convert(usdAmount) : usdAmount;
    return `${payCurrency} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const callbackUrl = encodeURIComponent('/projects');
      router.replace(`/login?callbackUrl=${callbackUrl}`);
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!buyerId) return;

    const controller = new AbortController();
    let isActive = true;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axiosInstance.get<ServiceOrder[]>(
          `/api/service-orders/buyer/${buyerId}`,
          { signal: controller.signal }
        );

        if (isActive) {
          setOrders(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        if (!isActive) return;

        if (
          axios.isCancel(err) ||
          (err as Error).name === 'CanceledError' ||
          (err as Error).name === 'AbortError'
        ) {
          return;
        }

        console.error('Failed to fetch orders:', err);
        setError('Failed to load your service orders. Please try again.');
      } finally {
        if (isActive) {
          setLoading(false);
          setHasFetched(true);
        }
      }
    };

    run();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [buyerId]);

  if (authLoading || loading || !hasFetched) {
    return <OrdersSkeleton />;
  }

  if (!isAuthenticated || !customer) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-500 dark:text-gray-400">
        Redirecting to login…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-red-600 dark:text-red-400 font-medium text-center">{error}</p>
        <button
          onClick={() => {
            setHasFetched(false);
            setLoading(true);
            const controller = new AbortController();
            axiosInstance
              .get<ServiceOrder[]>(`/api/service-orders/buyer/${buyerId}`, {
                signal: controller.signal,
              })
              .then((res) => {
                setOrders(Array.isArray(res.data) ? res.data : []);
                setError(null);
              })
              .catch((err) => {
                if (
                  !axios.isCancel(err) &&
                  (err as Error).name !== 'CanceledError' &&
                  (err as Error).name !== 'AbortError'
                ) {
                  setError('Failed to load your service orders. Please try again.');
                }
              })
              .finally(() => {
                setLoading(false);
                setHasFetched(true);
              });
          }}
          className="px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:opacity-90 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-5">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No service orders yet
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
          Once you place an order, it will appear here so you can track progress and payments.
        </p>
        <Link
          href="/services"
          className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition"
        >
          Browse Services
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            My Projects
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track the status and progress of your service orders.
          </p>
        </div>

        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-2">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => router.push(`/projects/${order.id}`)}
              className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800/50 transition cursor-pointer flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-snug line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">
                  {order.service_title}
                </h3>
                <span
                  className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[order.status].className}`}
                >
                  {statusConfig[order.status].label}
                </span>
              </div>

              {/* Package & Price */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {order.package_type}
                </span>
                <div className="text-right">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatMoney(order.total_price)}
                  </span>
                  {showLocalEstimate && (
                    <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      ≈ {format(order.total_price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 space-y-1 text-xs text-gray-400 dark:text-gray-500">
                <p>
                  Created{' '}
                  {new Date(order.created_at).toLocaleDateString('en-KE', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                {order.due_date && (
                  <p>
                    Due{' '}
                    {new Date(order.due_date).toLocaleDateString('en-KE', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
