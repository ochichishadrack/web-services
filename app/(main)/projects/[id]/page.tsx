"use client";

import { useEffect, useMemo, useState, JSX } from "react";
import { useParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/utils/axiosInstance";
import TopNav from "@/components/ui/DynamicTopNav";

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

/* ---------------- SKELETONS ---------------- */

function HeaderSkeleton(): JSX.Element {
  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm animate-pulse space-y-3">
      <div className="h-6 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />

      <div className="flex justify-between mt-4">
        <div className="h-5 bg-gray-200 rounded w-28" />
        <div className="h-5 bg-gray-200 rounded w-20" />
      </div>

      <div className="h-3 bg-gray-200 rounded w-32" />
    </div>
  );
}

function FeaturesSkeleton(): JSX.Element {
  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-40 mb-4" />

      <div className="grid sm:grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-full" />
        ))}
      </div>
    </div>
  );
}

function PhasesSkeleton(): JSX.Element {
  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-40 mb-4" />

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-3 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-3 bg-gray-200 rounded w-24" />
          </div>
        ))}
      </div>

      <div className="h-10 bg-gray-200 rounded w-full mt-5" />
    </div>
  );
}

function DeliveriesSkeleton(): JSX.Element {
  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-40 mb-4" />

      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-2 mb-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-32" />
        </div>
      ))}
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
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-6">
          <HeaderSkeleton />
          <FeaturesSkeleton />
          <PhasesSkeleton />
          <DeliveriesSkeleton />
        </div>
      </div>
    );
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
    <div className="max-w-6xl bg-white">
      <TopNav title="Order Details" />
      {/* HEADER */}
      <div className="max-w-6xl bg-white mx-auto p-4 md:p-10 space-y-6">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">
            {order.service_title}
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            {order.package_name} ({order.package_type})
          </p>

          <div className="flex justify-between mt-4">
            <span className="text-lg font-bold text-blue-900">
              {formatKES(order.total_price)}
            </span>

            <span
              className={`px-3 py-1 text-xs rounded capitalize ${
                statusStyles[order.status] ?? "bg-gray-100 text-gray-700"
              }`}
            >
              {order.status.replace(/_/g, " ")}
            </span>
          </div>

          <p className="text-xs text-gray-400 mt-2">
            Due: {new Date(order.due_date).toLocaleDateString()}
          </p>
        </div>

        {/* PACKAGE DETAILS */}

        {order.package && (
          <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="font-semibold text-gray-800 text-lg">
              Package Details
            </h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {order.package.delivery_days !== undefined && (
                <div className="border rounded-lg p-4">
                  <p className="text-gray-500 text-xs">Delivery Time</p>
                  <p className="font-semibold text-gray-800">
                    {order.package.delivery_days} Days
                  </p>
                </div>
              )}

              {order.package.revisions !== undefined && (
                <div className="border rounded-lg p-4">
                  <p className="text-gray-500 text-xs">Revisions</p>
                  <p className="font-semibold text-gray-800">
                    {order.package.revisions}
                  </p>
                </div>
              )}

              {order.package.pages != null && (
                <div className="border rounded-lg p-4">
                  <p className="text-gray-500 text-xs">Pages</p>
                  <p className="font-semibold text-gray-800">
                    {order.package.pages}
                  </p>
                </div>
              )}

              {order.package.products != null && (
                <div className="border rounded-lg p-4">
                  <p className="text-gray-500 text-xs">Products</p>
                  <p className="font-semibold text-gray-800">
                    {order.package.products}
                  </p>
                </div>
              )}
            </div>

            {order.package.description && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Package Description
                </h3>
                <p className="text-sm text-gray-600">
                  {order.package.description}
                </p>
              </div>
            )}

            {order.package.features?.length ? (
              <div>
                <h3 className="font-medium text-gray-700 mb-3">
                  Included Features
                </h3>

                <ul className="grid sm:grid-cols-2 gap-2 text-gray-600 text-sm">
                  {order.package.features.map((feature, index) => (
                    <li key={`${feature}-${index}`} className="flex gap-2">
                      <span className="text-green-600">✔</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}

        {/* PHASES */}

        {order.phases ? (
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-4">Payment Phases</h2>

            <div className="space-y-3">
              {Object.entries(order.phases).map(([key, phase]) => (
                <div
                  key={key}
                  className="flex justify-between items-center border rounded-lg p-3"
                >
                  <div>
                    <p className="capitalize text-gray-700 font-medium">
                      {key}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatKES(phase.amount)}
                    </p>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      phase.paid
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {phase.paid ? "Paid" : "Unpaid"}
                  </span>
                </div>
              ))}
            </div>

            {nextUnpaidPhase && (
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/projects/pay/${order.id}?phase=${nextUnpaidPhase[0]}`,
                  )
                }
                className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium"
              >
                Pay Next Phase ({nextUnpaidPhase[0].toUpperCase()})
              </button>
            )}
          </div>
        ) : null}

        {/* DELIVERIES */}

        {order.deliveries?.length ? (
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold mb-4">Deliveries</h2>

            <div className="space-y-4">
              {order.deliveries.map((delivery, index) => (
                <div
                  key={`${delivery.message}-${index}`}
                  className="border rounded-lg p-4"
                >
                  <p className="mb-3">{delivery.message}</p>

                  {delivery.file_urls?.map((url, idx) => (
                    <a
                      key={`${url}-${idx}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 underline text-xs"
                    >
                      Download File
                    </a>
                  ))}

                  {delivery.delivered_at && (
                    <p className="text-xs text-gray-400 mt-2">
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
