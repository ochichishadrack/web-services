"use client";

import { useEffect, useMemo, useState, JSX } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { axiosInstance } from "@/utils/axiosInstance";
import TopNav from "@/components/ui/DynamicTopNav";
import ServiceOrderDetailsSkeleton from "./ServiceOrderDetailsSkeleton";
import { useLocalCurrency } from "@/hooks/useLocalCurrency";

/* ---------------- TYPES ---------------- */
type OrderStatus =
  | "pending"
  | "paid"
  | "delivered"
  | "completed"
  | "cancelled"
  | "disputed"
  | "phase_1_in_progress"
  | "phase_1_completed"
  | "phase_2_in_progress"
  | "phase_2_completed"
  | "phase_3_in_progress"
  | "phase_3_completed";

interface Phase {
  amount: number; // USD
  paid: boolean;
  amount_paid?: number;
}

interface Delivery {
  message: string;
  file_urls?: string[];
  delivered_at?: string;
}

interface PackageData {
  id?: string;
  name?: string;
  type?: string;
  price?: number;
  delivery_days?: number;
  revisions?: number | string;
  pages?: number | string | null;
  products?: number | string | null;
  description?: string | null;
  features?: string[] | null;
}

interface ServiceOrder {
  id: string;
  service_title: string;
  package_name: string;
  package_type: string;
  total_price: number; // USD
  status: OrderStatus;
  due_date: string;
  created_at: string;
  phases?: Record<string, Phase>;
  deliveries?: Delivery[];
  package?: PackageData;
}

/* ---------------- HELPERS ---------------- */
const statusConfig: Record<OrderStatus, { label: string; className: string }> =
  {
    pending: {
      label: "Pending",
      className:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    },
    paid: {
      label: "Paid",
      className:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    },
    delivered: {
      label: "Delivered",
      className:
        "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    },
    completed: {
      label: "Completed",
      className:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    },
    disputed: {
      label: "Disputed",
      className:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    },
    phase_1_in_progress: {
      label: "Phase 1 In Progress",
      className:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    },
    phase_1_completed: {
      label: "Phase 1 Completed",
      className:
        "bg-purple-200 text-purple-900 dark:bg-purple-900/50 dark:text-purple-200",
    },
    phase_2_in_progress: {
      label: "Phase 2 In Progress",
      className:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
    },
    phase_2_completed: {
      label: "Phase 2 Completed",
      className:
        "bg-indigo-200 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-200",
    },
    phase_3_in_progress: {
      label: "Phase 3 In Progress",
      className:
        "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
    },
    phase_3_completed: {
      label: "Phase 3 Completed",
      className:
        "bg-violet-200 text-violet-900 dark:bg-violet-900/50 dark:text-violet-200",
    },
  };

function InfoCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 font-semibold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function ServiceOrderDetailsPage(): JSX.Element | null {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params?.id;

  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------- Currency ----------
  const {
    currency: localCurrency,
    convert,
    format,
    loading: currencyLoading,
  } = useLocalCurrency();

  const payCurrency: "KES" | "USD" = localCurrency === "KES" ? "KES" : "USD";
  const isKes = payCurrency === "KES";
  const showLocalEstimate = !currencyLoading && localCurrency !== payCurrency;

  const formatMoney = (usdAmount: number) => {
    const amount = isKes ? convert(usdAmount) : usdAmount;
    return `${payCurrency} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  useEffect(() => {
    if (!orderId) return;

    const controller = new AbortController();
    let isActive = true;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        setOrder(null);

        const res = await axiosInstance.get<ServiceOrder>(
          `/api/service-orders/${orderId}`,
          { signal: controller.signal },
        );

        if (isActive) {
          setOrder(res.data);
        }
      } catch (err) {
        if (!isActive) return;

        if (
          axios.isCancel(err) ||
          (err as Error).name === "CanceledError" ||
          (err as Error).name === "AbortError"
        ) {
          return;
        }

        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setOrder(null);
          setError(null);
          return;
        }

        console.error(err);
        setError("Failed to load order details. Please try again.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [orderId]);

  const nextUnpaidPhase = useMemo(() => {
    if (!order?.phases) return null;
    return (
      Object.entries(order.phases).find(([, phase]) => !phase.paid) ?? null
    );
  }, [order]);

  if (loading) {
    return <ServiceOrderDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-red-600 dark:text-red-400 font-medium text-center">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:opacity-90 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Order not found.
        </p>
        <button
          onClick={() => router.push("/projects")}
          className="text-sm text-orange-600 hover:underline"
        >
          Back to projects
        </button>
      </div>
    );
  }

  const status = statusConfig[order.status] ?? {
    label: order.status.replace(/_/g, " "),
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopNav title="Order Details" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {order.service_title}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {order.package_name} · {order.package_type}
              </p>
            </div>

            <span
              className={`self-start px-3 py-1 rounded-full text-xs font-medium ${status.className}`}
            >
              {status.label}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total Amount
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatMoney(order.total_price)}
                {showLocalEstimate && (
                  <span className="block text-sm font-normal text-gray-400 dark:text-gray-500 mt-0.5">
                    ≈ {format(order.total_price)}
                  </span>
                )}
              </p>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 text-right">
              <p>
                Created{" "}
                {new Date(order.created_at).toLocaleDateString("en-KE", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              {order.due_date && (
                <p>
                  Due{" "}
                  {new Date(order.due_date).toLocaleDateString("en-KE", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Package Details */}
        {order.package && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Package Details
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {order.package.delivery_days !== undefined && (
                <InfoCard
                  label="Delivery Time"
                  value={`${order.package.delivery_days} Days`}
                />
              )}
              {order.package.revisions !== undefined && (
                <InfoCard label="Revisions" value={order.package.revisions} />
              )}
              {Number(order.package.pages ?? 0) > 0 && (
                <InfoCard
                  label="Pages"
                  value={
                    Number(order.package.pages) === 1
                      ? "1 Page"
                      : `${order.package.pages} Pages`
                  }
                />
              )}
              {Number(order.package.products ?? 0) > 0 && (
                <InfoCard
                  label="Products"
                  value={
                    Number(order.package.products) === 1
                      ? "1 Product"
                      : `${order.package.products} Products`
                  }
                />
              )}
            </div>

            {order.package.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Description
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {order.package.description}
                </p>
              </div>
            )}

            {order.package.features && order.package.features.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Included Features
                </h3>
                <ul className="grid sm:grid-cols-2 gap-2.5">
                  {order.package.features.map((feature, index) => (
                    <li
                      key={`${feature}-${index}`}
                      className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <span className="mt-0.5 text-green-600 dark:text-green-400">
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Payment Phases */}
        {order.phases && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
              Payment Phases
            </h2>

            <div className="space-y-3">
              {Object.entries(order.phases).map(([key, phase]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 px-4 py-3.5"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {key.replace(/_/g, " ")}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {formatMoney(phase.amount)}
                      {showLocalEstimate && (
                        <span className="block text-xs text-gray-400 dark:text-gray-500">
                          ≈ {format(phase.amount)}
                        </span>
                      )}
                    </p>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      phase.paid
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {phase.paid ? "Paid" : "Unpaid"}
                  </span>
                </div>
              ))}
            </div>

            {nextUnpaidPhase && (
              <button
                onClick={() =>
                  router.push(
                    `/projects/pay/${order.id}?phase=${nextUnpaidPhase[0]}`,
                  )
                }
                className="mt-6 w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition active:scale-[0.98]"
              >
                Pay Next Phase ({nextUnpaidPhase[0].replace(/_/g, " ")})
              </button>
            )}
          </div>
        )}

        {/* Deliveries */}
        {order.deliveries && order.deliveries.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
              Deliveries
            </h2>

            <div className="space-y-4">
              {order.deliveries.map((delivery, index) => (
                <div
                  key={`${delivery.message}-${index}`}
                  className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 p-5"
                >
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                    {delivery.message}
                  </p>

                  {delivery.file_urls && delivery.file_urls.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {delivery.file_urls.map((url, idx) => (
                        <a
                          key={`${url}-${idx}`}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-orange-600 dark:text-orange-400 hover:underline"
                        >
                          Download File{" "}
                          {delivery.file_urls!.length > 1 ? idx + 1 : ""}
                        </a>
                      ))}
                    </div>
                  )}

                  {delivery.delivered_at && (
                    <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                      Delivered{" "}
                      {new Date(delivery.delivered_at).toLocaleDateString(
                        "en-KE",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
