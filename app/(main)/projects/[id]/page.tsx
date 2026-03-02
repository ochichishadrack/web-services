"use client";

import { useEffect, useMemo, useState, JSX } from "react";
import { useParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/utils/axiosInstance";
import TopNav from "@/components/ui/DynamicTopNav";
import ServiceOrderDetailsSkeleton from "./ServiceOrderDetailsSkeleton";
/* ---------------- TYPES ---------------- */

type OrderStatus =
  /* Core lifecycle */
  | "pending"
  | "paid"
  | "delivered"
  | "completed"
  | "cancelled"
  | "disputed"

  /* Phase tracking */
  | "phase_1_in_progress"
  | "phase_1_completed"
  | "phase_2_in_progress"
  | "phase_2_completed"
  | "phase_3_in_progress"
  | "phase_3_completed";

interface Phase {
  amount: number;
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
  total_price: number;
  status: OrderStatus;
  due_date: string;
  created_at: string;
  phases?: Record<string, Phase>;
  deliveries?: Delivery[];
  package?: PackageData;
}

/* ---------------- HELPERS ---------------- */

const formatKES = (amount: number): string => `KES ${amount.toLocaleString()}`;

const statusStyles: Record<OrderStatus, string> = {
  /* Core lifecycle */
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
  disputed: "bg-orange-100 text-orange-800",

  /* Phase tracking */
  phase_1_in_progress: "bg-purple-100 text-purple-800",
  phase_1_completed: "bg-purple-200 text-purple-900",
  phase_2_in_progress: "bg-indigo-100 text-indigo-800",
  phase_2_completed: "bg-indigo-200 text-indigo-900",
  phase_3_in_progress: "bg-violet-100 text-violet-800",
  phase_3_completed: "bg-violet-200 text-violet-900",
};

function InfoCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/40 transition">
      <p className="text-gray-500 dark:text-gray-400 text-xs">{label}</p>
      <p className="font-semibold text-gray-900 dark:text-gray-100 mt-1">
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState<boolean>(false);

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    if (!orderId) return;

    const controller = new AbortController();

    const fetchOrder = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const res = await axiosInstance.get<ServiceOrder>(
          `/api/service-orders/${orderId}`,
          { signal: controller.signal },
        );

        setOrder(res.data);
      } catch (err) {
        if ((err as Error).name !== "CanceledError") {
          console.error(err);
          setError("Failed to load order details.");
        }
      } finally {
        setLoading(false);
        setHasFetched(true); // ✅ mark fetch complete
      }
    };

    fetchOrder();
    return () => controller.abort();
  }, [orderId]);

  /* ---------------- PHASE LOGIC ---------------- */

  const nextUnpaidPhase = useMemo(() => {
    if (!order?.phases) return null;

    const entry = Object.entries(order.phases).find(([, phase]) => !phase.paid);

    return entry ?? null;
  }, [order]);

  /* ---------------- LOADING UI ---------------- */

  /* ---------------- LOADING ---------------- */

  if (loading || !hasFetched) {
    return <ServiceOrderDetailsSkeleton />;
  }
  /* ---------------- ERROR ---------------- */

  if (error) {
    return (
      <div className="p-10 text-center text-red-600 font-medium">{error}</div>
    );
  }

  /* ---------------- NO DATA ---------------- */
  /* Only show if backend finished AND returned null */

  if (hasFetched && !order) {
    return null; // or keep skeleton if you prefer
  }

  /* ---------------- ERROR ---------------- */

  if (error) {
    return (
      <div className="p-10 text-center text-red-600 font-medium">{error}</div>
    );
  }

  /* ---------------- NOT FOUND ---------------- */

  if (!order) {
    return (
      <div className="p-10 text-center text-gray-600">Order not found.</div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <TopNav title="Order Details" />

      <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-8">
        {/* HEADER */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm transition-colors">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {order.service_title}
          </h1>

          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {order.package_name} ({order.package_type})
          </p>

          <div className="flex justify-between items-center mt-6">
            <span className="text-xl font-bold text-blue-700 dark:text-blue-400">
              {formatKES(order.total_price)}
            </span>

            <span
              className={`px-3 py-1 text-xs rounded-full capitalize font-medium ${
                statusStyles[order.status] ??
                "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              {order.status.replace(/_/g, " ")}
            </span>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
            Due: {new Date(order.due_date).toLocaleDateString()}
          </p>
        </div>

        {/* PACKAGE DETAILS */}
        {order.package && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-6 transition-colors">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
              Package Details
            </h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5 text-sm">
              {order.package.delivery_days !== undefined && (
                <InfoCard
                  label="Delivery Time"
                  value={`${order.package.delivery_days} Days`}
                />
              )}

              {order.package.revisions !== undefined && (
                <InfoCard label="Revisions" value={order.package.revisions} />
              )}

              {order.package.pages != null && (
                <InfoCard label="Pages" value={order.package.pages} />
              )}

              {order.package.products != null && (
                <InfoCard label="Products" value={order.package.products} />
              )}
            </div>

            {order.package.description && (
              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Package Description
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {order.package.description}
                </p>
              </div>
            )}

            {order.package.features?.length ? (
              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Included Features
                </h3>

                <ul className="grid sm:grid-cols-2 gap-3 text-sm">
                  {order.package.features.map((feature, index) => (
                    <li
                      key={`${feature}-${index}`}
                      className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                    >
                      <span className="text-green-600 dark:text-green-400">
                        ✔
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}

        {/* PHASES */}
        {order.phases && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm transition-colors">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-5">
              Payment Phases
            </h2>

            <div className="space-y-4">
              {Object.entries(order.phases).map(([key, phase]) => (
                <div
                  key={key}
                  className="flex justify-between items-center border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/40 transition"
                >
                  <div>
                    <p className="capitalize text-gray-800 dark:text-gray-200 font-medium">
                      {key}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatKES(phase.amount)}
                    </p>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      phase.paid
                        ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
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
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold shadow-md transition active:scale-[0.98]"
              >
                Pay Next Phase ({nextUnpaidPhase[0].toUpperCase()})
              </button>
            )}
          </div>
        )}

        {/* DELIVERIES */}
        {order.deliveries?.length ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm transition-colors">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-5">
              Deliveries
            </h2>

            <div className="space-y-5">
              {order.deliveries.map((delivery, index) => (
                <div
                  key={`${delivery.message}-${index}`}
                  className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 bg-gray-50 dark:bg-gray-800/40 transition"
                >
                  <p className="text-gray-800 dark:text-gray-200 mb-3">
                    {delivery.message}
                  </p>

                  {delivery.file_urls?.map((url, idx) => (
                    <a
                      key={`${url}-${idx}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 dark:text-blue-400 hover:underline text-xs mb-1"
                    >
                      Download File
                    </a>
                  ))}

                  {delivery.delivered_at && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      Delivered:{" "}
                      {new Date(delivery.delivered_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
