'use client';

import { JSX, useCallback, useEffect, useState } from 'react';
import { axiosInstance } from '@/utils/axiosInstance';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ServiceOrder {
  id: string;
  service_title: string;
  package_type: string;
  total_price: number;
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
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
  },
  paid: {
    label: 'Paid',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-700 dark:text-emerald-100',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-700 dark:text-purple-100',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100',
  },
  disputed: {
    label: 'Disputed',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100',
  },
  phase_1_in_progress: {
    label: 'Phase 1 In Progress',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100',
  },
  phase_1_completed: {
    label: 'Phase 1 Completed',
    className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-indigo-100',
  },
  phase_2_in_progress: {
    label: 'Phase 2 In Progress',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100',
  },
  phase_2_completed: {
    label: 'Phase 2 Completed',
    className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-indigo-100',
  },
  phase_3_in_progress: {
    label: 'Phase 3 In Progress',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100',
  },
  phase_3_completed: {
    label: 'Phase 3 Completed',
    className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-indigo-100',
  },
};

/* ---------------- Skeleton Card ---------------- */
function SkeletonCard(): JSX.Element {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm animate-pulse w-full">
      <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-3"></div>
      <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-3"></div>
      <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-3"></div>
    </div>
  );
}

/* ---------------- Page ---------------- */
export default function ServiceOrders(): JSX.Element {
  const { customer, loading: authLoading, isAuthenticated } = useCustomerAuth();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const buyerId = customer?.public_id ?? null;

  /* ✅ Redirect if not logged in */
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const callbackUrl = encodeURIComponent('/projects');
      router.replace(`/login?callbackUrl=${callbackUrl}`);
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchOrders = useCallback(
    async (signal?: AbortSignal) => {
      if (!buyerId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await axiosInstance.get<ServiceOrder[]>(
          `/api/service-orders/buyer/${buyerId}`,
          { signal }
        );
        setOrders(res.data);
      } catch (err) {
        if ((err as Error).name !== 'CanceledError') {
          console.error('Failed to fetch orders:', err);
          setError('Failed to load your service orders.');
        }
      } finally {
        setLoading(false);
      }
    },
    [buyerId]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchOrders(controller.signal);
    return () => controller.abort();
  }, [fetchOrders]);

  /* ---------------- Render States ---------------- */
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Cards Grid */}
          <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm animate-pulse space-y-4"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                </div>

                {/* Package + Price */}
                <div className="flex justify-between items-center">
                  <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>

                {/* Dates */}
                <div className="space-y-2">
                  <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !customer) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[40vh] text-gray-500 dark:text-gray-400">
        Redirecting to login…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-400 font-medium">{error}</div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[40vh] text-gray-500 dark:text-gray-400">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Service Orders</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          You don’t have any service orders yet.
        </p>
        <Link
          href="/services"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
        >
          Browse Services
        </Link>
      </div>
    );
  }

  /* ---------------- Orders Grid ---------------- */
  return (
    <div className="px-4 sm:px-6 bg-white dark:bg-gray-950 min-h-screen transition-colors overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="w-full min-w-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
              onClick={() => router.push(`/projects/${order.id}`)}
            >
              {/* Header */}
              <div className="flex items-start gap-3 min-w-0">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm sm:text-base md:text-lg wrap-break-word min-w-0 flex-1">
                  {order.service_title}
                </h3>

                <span
                  className={`shrink-0 px-2.5 py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap ${statusConfig[order.status].className}`}
                >
                  {statusConfig[order.status].label}
                </span>
              </div>

              {/* Package & Price */}
              <div className="flex items-start justify-between gap-3 mt-3 text-sm sm:text-base min-w-0">
                <p className="text-gray-500 dark:text-gray-300 wrap-break-word min-w-0 flex-1">
                  Package: {order.package_type}
                </p>

                <span className="font-semibold text-gray-900 dark:text-gray-100 shrink-0">
                  KES {order.total_price.toLocaleString()}
                </span>
              </div>

              {/* Dates */}
              <div className="mt-3 text-xs sm:text-sm text-gray-400 dark:text-gray-400 space-y-1">
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
