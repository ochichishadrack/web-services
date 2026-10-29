"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Info, Loader2, AlertTriangle } from "lucide-react";
import { axiosInstance } from "@/utils/axiosInstance";
import { useLocalCurrency } from "@/hooks/useLocalCurrency";

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
  total_price: number; // USD
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

const mapPhaseForBackend = (phase: PhaseKey): PhaseKey =>
  phase === "phase1_2" ? "phase1_2" : phase;

const tileCls =
  "rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5";

const tileLabelCls =
  "text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400";

/* ---------------- PAGE ---------------- */

export default function PaymentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = params?.id ?? "";
  const phaseParam = (searchParams.get("phase") ?? "full") as PhaseKey;

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [amountUsd, setAmountUsd] = useState<number | null>(null);
  const [loadingAmount, setLoadingAmount] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    currency: localCurrency,
    convert,
    format,
    loading: currencyLoading,
  } = useLocalCurrency();

  // Kenya → KES, everyone else → USD
  const isKenya = !currencyLoading && localCurrency === "KES";
  const paymentCurrency = isKenya ? "KES" : "USD";

  const backendPhase = mapPhaseForBackend(phaseParam);
  const isLoading = loadingAmount || !hasFetched || currencyLoading;

  const formatMoney = (usdAmount: number) => {
    if (isKenya) {
      // Convert USD → KES and show with KES
      if (typeof format === "function") {
        return format(usdAmount);
      }
      const amount = convert(usdAmount);
      return `KES ${amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    // Non-Kenya: always show USD (no conversion)
    return `USD ${usdAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

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

        if (controller.signal.aborted) return;

        const orderData = res.data;
        setOrder(orderData);

        const extrasTotal =
          orderData.extras
            ?.filter((e) => e.enabled)
            .reduce((sum, e) => sum + e.price, 0) ?? 0;

        const baseTotal = orderData.total_price + extrasTotal;

        if (backendPhase === "full") {
          setAmountUsd(baseTotal);
        } else if (backendPhase === "phase1_2") {
          const p1 = orderData.phases.phase1?.amount ?? 0;
          const p2 = orderData.phases.phase2?.amount ?? 0;
          setAmountUsd(p1 + p2);
        } else {
          const phaseData =
            orderData.phases[backendPhase as "phase1" | "phase2" | "phase3"];
          setAmountUsd(phaseData?.amount ?? null);
        }
      } catch (err) {
        if (
          controller.signal.aborted ||
          (err as Error).name === "CanceledError" ||
          (err as Error).name === "AbortError"
        ) {
          return;
        }

        console.error(err);
        setError("Unable to load order.");
        setAmountUsd(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoadingAmount(false);
          setHasFetched(true);
        }
      }
    };

    fetchOrder();

    return () => controller.abort();
  }, [orderId, backendPhase]);

  /* ---------------- INITIALIZE PAYMENT ---------------- */
  const handlePay = async () => {
    if (amountUsd === null) return;

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
        amount: amountUsd, // always send USD amount to backend
        currency: paymentCurrency, // KES for Kenya, USD for everyone else
        callback_url: `${window.location.origin}/payment/verify`,
      };

      const formData = new FormData();
      formData.append("payload_json", JSON.stringify(payload));

      const res = await axiosInstance.post<InitializeResponse>(
        "/api/paystack_global/initialize",
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
      <main className="flex min-h-[100dvh] items-center justify-center bg-white px-4 dark:bg-[#1f2228]">
        <div
          role="alert"
          className="flex items-center gap-2 text-base font-semibold text-red-600 dark:text-red-400"
        >
          <AlertTriangle className="h-5 w-5 shrink-0" />
          Invalid order ID
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-white px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))] text-gray-900 transition-colors sm:px-6 dark:bg-[#1f2228] dark:text-white">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold sm:text-3xl">Complete payment</h1>
          <p className="mt-2 text-sm text-gray-500 sm:text-base dark:text-gray-400">
            Secure checkout for your service.
          </p>
        </div>

        {/* Loading currency */}
        {currencyLoading && (
          <div className="flex flex-col items-center gap-3 py-12 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Detecting your currency...</p>
          </div>
        )}

        {/* Payment flow (KES or USD) */}
        {!currencyLoading && (
          <div className="space-y-5">
            <div className="space-y-3">
              <div className={tileCls}>
                <span className={tileLabelCls}>Payment type</span>
                <p className="mt-1 text-sm font-semibold">{phaseLabel}</p>
              </div>

              <div className={tileCls}>
                <span className={tileLabelCls}>
                  Amount payable ({paymentCurrency})
                </span>

                <div className="mt-2 flex min-h-[28px] items-center">
                  {isLoading ? (
                    <div className="flex items-center gap-2.5 text-gray-400">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm">Loading amount…</span>
                    </div>
                  ) : amountUsd !== null ? (
                    <span className="break-words text-2xl font-bold tracking-tight">
                      {formatMoney(amountUsd)}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">Unavailable</span>
                  )}
                </div>
              </div>

              {/* Note for non-Kenya users */}
              {!isKenya && (
                <div className="flex items-start gap-2.5 rounded-xl border border-gray-100 px-3.5 py-3 dark:border-white/10">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                    You are paying in{" "}
                    <strong className="font-semibold text-gray-900 dark:text-white">
                      USD
                    </strong>
                    . Online payments in other local currencies are not
                    available yet.
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="min-w-0 break-words">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                type="button"
                onClick={handlePay}
                disabled={loadingPayment || isLoading || amountUsd === null}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-[#1f2228]"
              >
                {loadingPayment && <Loader2 className="h-4 w-4 animate-spin" />}
                {loadingPayment
                  ? "Redirecting…"
                  : `Proceed to pay (${paymentCurrency})`}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                disabled={loadingPayment}
                className="flex h-11 w-full items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-transparent dark:text-gray-200 dark:hover:bg-white/5"
              >
                Cancel
              </button>
            </div>

            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              Securely processed via Paystack · {paymentCurrency}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
