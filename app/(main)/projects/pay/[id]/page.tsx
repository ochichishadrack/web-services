"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Info, Mail, Loader2 } from "lucide-react";
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

/* ---------------- WHATSAPP ICON ---------------- */
function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-red-600 dark:text-red-400 font-semibold text-base">
          Invalid order ID
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-10 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-6 text-center border-b border-gray-100 dark:border-gray-800">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
            Complete Payment
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Secure checkout for your service
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Loading currency */}
          {currencyLoading && (
            <div className="py-12 flex flex-col items-center gap-3 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-sm">Detecting your currency...</p>
            </div>
          )}

          {/* Payment flow (KES or USD) */}
          {!currencyLoading && (
            <>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                    Payment Type
                  </span>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {phaseLabel}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                    Amount Payable ({paymentCurrency})
                  </span>

                  <div className="mt-2 min-h-[28px] flex items-center">
                    {isLoading ? (
                      <div className="flex items-center gap-2.5 text-gray-400">
                        <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                        <span className="text-sm">Loading amount…</span>
                      </div>
                    ) : amountUsd !== null ? (
                      <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {formatMoney(amountUsd)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Unavailable</span>
                    )}
                  </div>
                </div>

                {/* Optional note for non-Kenya users */}
                {!isKenya && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-3.5 py-3">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                      You are paying in <strong>USD</strong>. Online payments in
                      other local currencies are not available yet.
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 font-medium text-center">
                  {error}
                </div>
              )}

              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={loadingPayment || isLoading || amountUsd === null}
                  className="w-full h-11 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  {loadingPayment && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {loadingPayment
                    ? "Redirecting…"
                    : `Proceed to Pay (${paymentCurrency})`}
                </button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={loadingPayment}
                  className="w-full h-10 text-gray-700 dark:text-gray-300 font-medium rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>

              <p className="text-[11px] text-center text-gray-400 dark:text-gray-500">
                Securely processed via Paystack · {paymentCurrency}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
