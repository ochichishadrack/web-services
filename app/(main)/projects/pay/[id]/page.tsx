"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { axiosInstance } from "@/utils/axiosInstance";

/* ---------------- TYPES ---------------- */

type PhaseKey = "phase1" | "phase2" | "phase3" | "phase1_2" | "full";

interface Extra {
  id: string;
  title: string;
  price: number;
  enabled: boolean;
}

interface OrderResponse {
  id: string;
  service_id: string;
  package_id: string;
  total_price: number;
  extras: Extra[];
  phases: Record<
    "phase1" | "phase2" | "phase3",
    { amount: number; paid: boolean }
  >;
}

interface InitializeResponse {
  authorization_url: string;
  reference: string;
}

/* ---------------- HELPERS ---------------- */

const formatKES = (amount: number): string => `KES ${amount.toLocaleString()}`;
const mapPhaseForBackend = (phase: PhaseKey): PhaseKey =>
  phase === "phase1_2" ? "phase1_2" : phase;

/* ---------------- PAGE ---------------- */

export default function PaymentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = params?.id ?? "";
  const phaseParam = (searchParams.get("phase") ?? "full") as PhaseKey;

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [loadingAmount, setLoadingAmount] = useState(true);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backendPhase = mapPhaseForBackend(phaseParam);

  /* ---------------- FETCH ORDER ---------------- */
  useEffect(() => {
    if (!orderId) return;
    const controller = new AbortController();

    const fetchOrder = async () => {
      try {
        setLoadingAmount(true);
        setError(null);
        const res = await axiosInstance.get<OrderResponse>(
          `/api/service-orders/${orderId}`,
          { signal: controller.signal },
        );
        const orderData = res.data;
        setOrder(orderData);

        const extrasTotal =
          orderData.extras
            ?.filter((e) => e.enabled)
            .reduce((sum, e) => sum + e.price, 0) ?? 0;

        const baseTotal = orderData.total_price + extrasTotal;

        if (backendPhase === "full") setAmount(baseTotal);
        else if (backendPhase === "phase1_2") {
          const p1 = orderData.phases.phase1?.amount ?? 0;
          const p2 = orderData.phases.phase2?.amount ?? 0;
          setAmount(p1 + p2);
        } else {
          const phaseData =
            orderData.phases[backendPhase as "phase1" | "phase2" | "phase3"];
          setAmount(phaseData?.amount ?? null);
        }
      } catch (err) {
        if ((err as Error).name !== "CanceledError") {
          console.error(err);
          setError("Unable to load order.");
        }
      } finally {
        setLoadingAmount(false);
      }
    };

    fetchOrder();
    return () => controller.abort();
  }, [orderId, backendPhase]);

  /* ---------------- INITIALIZE PAYMENT ---------------- */
  const handlePay = async () => {
    if (!amount) return;

    try {
      setLoadingPayment(true);
      setError(null);

      const payload = {
        order_id: order?.id ?? null,
        service_id: order?.service_id ?? null,
        package_id: order?.package_id ?? null,
        payment_type: "service",
        extras_ids:
          order?.extras?.filter((e) => e.enabled).map((e) => e.id) ?? [],
        phase: backendPhase,
        amount: Math.round(amount * 100),
        callback_url: `${window.location.origin}/payment/verify`,
      };

      const formData = new FormData();
      formData.append("payload_json", JSON.stringify(payload));

      const res = await axiosInstance.post<InitializeResponse>(
        "/api/paystack/initialize",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      window.location.href = res.data.authorization_url;
    } catch (err) {
      console.error(err);
      setError("Payment initialization failed.");
      setLoadingPayment(false);
    }
  };

  /* ---------------- LABEL ---------------- */
  const phaseLabel = useMemo(() => {
    if (backendPhase === "full") return "Full Payment";
    if (backendPhase === "phase1_2") return "Phase 1 + 2";
    return backendPhase.toUpperCase();
  }, [backendPhase]);

  /* ---------------- UI ---------------- */
  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="text-red-600 dark:text-red-400 font-semibold text-base">
          Invalid order ID
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 space-y-5 border border-gray-100 dark:border-gray-700 transition-colors">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Complete Payment
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Secure checkout for your service
          </p>
        </div>

        {/* Payment Info */}
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col transition-colors">
            <span className="text-xs font-medium text-gray-400 dark:text-gray-300 uppercase tracking-wide">
              Payment Type
            </span>
            <span className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
              {phaseLabel}
            </span>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col transition-colors">
            <span className="text-xs font-medium text-gray-400 dark:text-gray-300 uppercase tracking-wide">
              Amount
            </span>
            <div className="mt-1">
              {loadingAmount ? (
                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
              ) : amount ? (
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatKES(amount)}
                </span>
              ) : (
                <span className="text-gray-400 dark:text-gray-300 text-sm">
                  Unavailable
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 font-medium text-center">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handlePay}
            disabled={loadingPayment || loadingAmount || !amount}
            className="w-full h-11 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-50 transition"
          >
            {loadingPayment ? "Redirecting…" : "Proceed to Pay"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="w-full h-10 text-gray-700 dark:text-gray-200 font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-gray-400 dark:text-gray-500 transition-colors">
          Securely processed via Paystack
        </p>
      </div>
    </div>
  );
}
