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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600 font-semibold text-base">
          Invalid order ID
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 space-y-4 border border-gray-100">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            Complete Payment
          </h1>
          <p className="text-gray-500 text-sm">
            Secure checkout for your service
          </p>
        </div>

        {/* Payment Info */}
        <div className="space-y-2">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Payment Type
            </span>
            <span className="mt-1 text-sm font-medium text-gray-900">
              {phaseLabel}
            </span>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Amount
            </span>
            <div className="mt-1">
              {loadingAmount ? (
                <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
              ) : amount ? (
                <span className="text-sm font-semibold text-gray-900">
                  {formatKES(amount)}
                </span>
              ) : (
                <span className="text-gray-400 text-sm">Unavailable</span>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-red-600 font-medium text-center">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handlePay}
            disabled={loadingPayment || loadingAmount || !amount}
            className="w-full h-10 bg-black text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition"
          >
            {loadingPayment ? "Redirecting…" : "Proceed to Pay"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="w-full h-9 text-gray-600 font-medium rounded-lg border border-gray-200 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-gray-400">
          Securely processed via Paystack
        </p>
      </div>
    </div>
  );
}
