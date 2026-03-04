"use client";

import { JSX, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/utils/axiosInstance";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import TopNav from "@/components/ui/DynamicTopNav";
import {
  Calendar,
  Layers,
  PackageIcon,
  Tag,
  UploadCloud,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import PaymentComponent from "@/components/payment/service_order";

/* ---------------- TYPES ---------------- */

interface Extra {
  id: string;
  title: string;
  price: number;
  delivery_days: number;
}

interface Requirement {
  id: string;
  question: string;
  type: "text" | "choice" | "file";
  options?: string[];
  required: boolean;
  allow_multiple?: boolean;
}

interface Package {
  id: string;
  name: string;
  description?: string;
  price: number;
  delivery_days: number;
  revisions: number | string;
  pages?: number;
  products?: number;
  features?: string[];
}

interface Service {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  packages: Package[];
  extras?: Extra[];
  requirements?: Requirement[];
}

type RequirementAnswer = string | string[] | File;

export default function ServiceCheckoutPage(): JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { customer, loading: authLoading } = useCustomerAuth();

  const serviceId = searchParams.get("serviceId") ?? "";
  const packageId = searchParams.get("packageId") ?? "";
  const extrasParam = searchParams.get("extras") ?? "";

  const buyerId = customer?.public_id ?? "";

  const selectedExtrasIds = useMemo(
    () => (extrasParam ? extrasParam.split(",") : []),
    [extrasParam],
  );

  const [service, setService] = useState<Service | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<Extra[]>([]);
  const [requirementAnswers, setRequirementAnswers] = useState<
    Record<string, RequirementAnswer>
  >({});
  const [loading, setLoading] = useState(true);
  const [dragActive, setDragActive] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  /* ---------------- AUTH REDIRECT ---------------- */

  useEffect(() => {
    if (!authLoading && !customer) {
      const currentUrl =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "";
      router.replace(`/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
    }
  }, [authLoading, customer, router]);

  /* ---------------- FETCH SERVICE ---------------- */

  useEffect(() => {
    if (!serviceId || !packageId) return;

    let mounted = true;

    async function fetchService() {
      try {
        setLoading(true);
        const res = await axiosInstance.get<Service>(
          `/api/web-services/${serviceId}/full`,
        );
        if (!mounted) return;

        const data = res.data;
        setService(data);

        setSelectedPackage(
          data.packages.find(
            (p: Package) => String(p.id) === String(packageId),
          ) ?? null,
        );

        setSelectedExtras(
          data.extras?.filter((e: Extra) =>
            selectedExtrasIds.includes(String(e.id)),
          ) ?? [],
        );
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void fetchService();
    return () => {
      mounted = false;
    };
  }, [serviceId, packageId, selectedExtrasIds]);

  /* ---------------- LOGIC ---------------- */

  const handleRequirementChange = (id: string, value: RequirementAnswer) => {
    setRequirementAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const requirementsComplete = useMemo(() => {
    if (!service?.requirements) return true;

    return service.requirements.every((req) => {
      if (!req.required) return true;

      const answer = requirementAnswers[req.id];

      if (req.type === "text")
        return typeof answer === "string" && answer.trim() !== "";

      if (req.type === "choice")
        return req.allow_multiple
          ? Array.isArray(answer) && answer.length > 0
          : !!answer;

      if (req.type === "file")
        return answer instanceof File || typeof answer === "string";

      return true;
    });
  }, [service?.requirements, requirementAnswers]);

  const extrasTotal = selectedExtras.reduce((s, e) => s + e.price, 0);
  const totalPrice = (selectedPackage?.price ?? 0) + extrasTotal;

  const handleProceedToPayment = () => {
    if (!requirementsComplete) {
      alert("Please fill all required fields");
      return;
    }
    setShowPayment(true);
  };

  /* ---------------- LOADING STATES ---------------- */

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 transition-colors">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600 dark:text-gray-400" />
      </div>
    );

  if (!service || !selectedPackage)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 transition-colors">
        <AlertCircle className="w-6 h-6 text-gray-500 dark:text-gray-400" />
      </div>
    );

  /* ---------------- PAYMENT VIEW ---------------- */

  if (showPayment) {
    return (
      <PaymentComponent
        customer={customer!}
        orderPayload={{
          buyer_id: buyerId,
          service_id: service.id,
          package_id: selectedPackage.id,
          extras_ids: selectedExtras.map((e) => e.id),
          requirements: Object.entries(requirementAnswers).map(
            ([field, value]) => ({ field, value }),
          ),
          seller_username: service.subcategory ?? "default_seller",
        }}
        selectedPackage={selectedPackage}
        selectedExtras={selectedExtras}
        onClose={() => setShowPayment(false)}
      />
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <TopNav title="Checkout" />

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-2 px-4 space-y-6 transition-colors">
        {/* SERVICE INFO */}
        <div className="py-6 px-2 space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {service.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {service.category}
            {service.subcategory && ` / ${service.subcategory}`}
          </p>
        </div>

        {/* PACKAGE INFO */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {selectedPackage.name}
              </h2>
              {selectedPackage.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-xl">
                  {selectedPackage.description}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Package Price
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                KES {selectedPackage.price.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>{selectedPackage.delivery_days} days</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Layers className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>{selectedPackage.revisions} revisions</span>
            </div>
            {Number(selectedPackage.pages ?? 0) > 0 && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <PackageIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span>
                  {Number(selectedPackage.pages)}{" "}
                  {Number(selectedPackage.pages) === 1 ? "page" : "pages"}
                </span>
              </div>
            )}
            {Number(selectedPackage.products ?? 0) > 0 && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span>
                  {Number(selectedPackage.products)}{" "}
                  {Number(selectedPackage.products) === 1
                    ? "product"
                    : "products"}
                </span>
              </div>
            )}
          </div>

          {Array.isArray(selectedPackage.features) &&
            selectedPackage.features.length > 0 && (
              <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  What’s Included
                </h3>
                <ul className="grid md:grid-cols-2 gap-y-2 gap-x-6 text-sm text-gray-700 dark:text-gray-300">
                  {selectedPackage.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>

        {/* EXTRAS */}
        {selectedExtras.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Selected Extras
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside space-y-1">
              {selectedExtras.map((extra) => (
                <li key={extra.id}>
                  {extra.title} — KES {extra.price.toLocaleString()} (
                  {extra.delivery_days} days)
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* REQUIREMENTS */}
        {Array.isArray(service.requirements) &&
          service.requirements.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 space-y-5">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                Requirements
              </h3>
              {service.requirements.map((req) => {
                const answer = requirementAnswers[req.id];

                return (
                  <div key={req.id} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {req.question}
                      {req.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>

                    {req.type === "text" && (
                      <input
                        type="text"
                        value={(answer as string) ?? ""}
                        onChange={(e) =>
                          handleRequirementChange(req.id, e.target.value)
                        }
                        className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm"
                      />
                    )}

                    {req.type === "file" && (
                      <div
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragActive(null);
                          const file = e.dataTransfer.files[0];
                          if (
                            file &&
                            (file.type.startsWith("image/") ||
                              file.name.toLowerCase().endsWith(".pdf"))
                          ) {
                            handleRequirementChange(req.id, file);
                          } else if (file) {
                            alert("Only image and PDF files are allowed");
                          }
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragActive(req.id);
                        }}
                        onDragLeave={() => setDragActive(null)}
                        onClick={() =>
                          document.getElementById(`file-${req.id}`)?.click()
                        }
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                          dragActive === req.id
                            ? "border-black dark:border-white bg-gray-100 dark:bg-gray-800"
                            : "border-gray-300 dark:border-gray-700 hover:border-gray-500 dark:hover:border-gray-400"
                        }`}
                      >
                        {answer instanceof File ? (
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                            <FileText className="w-4 h-4" />
                            {answer.name}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                            <UploadCloud className="w-6 h-6" />
                            Drag & drop file or click to upload (Images & PDFs
                            only)
                          </div>
                        )}
                        <input
                          id={`file-${req.id}`}
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (
                              file &&
                              (file.type.startsWith("image/") ||
                                file.name.toLowerCase().endsWith(".pdf"))
                            ) {
                              handleRequirementChange(req.id, file);
                            } else if (file) {
                              alert("Only image and PDF files are allowed");
                            }
                          }}
                        />
                      </div>
                    )}

                    {req.type === "choice" &&
                      Array.isArray(req.options) &&
                      req.options.length > 0 && (
                        <div className="flex flex-col gap-2">
                          {req.options.map((opt) => {
                            const selected = req.allow_multiple
                              ? Array.isArray(answer) && answer.includes(opt)
                              : answer === opt;

                            return (
                              <label
                                key={opt}
                                className={`flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer transition ${
                                  selected
                                    ? "border-black dark:border-white bg-gray-50 dark:bg-gray-800"
                                    : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                                }`}
                              >
                                <input
                                  type={
                                    req.allow_multiple ? "checkbox" : "radio"
                                  }
                                  name={`choice-${req.id}`}
                                  checked={selected}
                                  onChange={() => {
                                    if (req.allow_multiple) {
                                      const prev = Array.isArray(answer)
                                        ? [...answer]
                                        : [];
                                      if (prev.includes(opt))
                                        handleRequirementChange(
                                          req.id,
                                          prev.filter((v) => v !== opt),
                                        );
                                      else
                                        handleRequirementChange(req.id, [
                                          ...prev,
                                          opt,
                                        ]);
                                    } else {
                                      handleRequirementChange(req.id, opt);
                                    }
                                  }}
                                  className="accent-black dark:accent-white"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {opt}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          )}

        <div className="bg-black dark:bg-white text-white dark:text-black rounded-2xl p-6 flex flex-col gap-3 transition-colors">
          <div className="flex justify-between">
            <span>Total</span>
            <span className="text-xl font-bold">
              KES {totalPrice.toLocaleString()}
            </span>
          </div>
          <button
            onClick={handleProceedToPayment}
            className="w-full py-3 rounded-xl font-semibold bg-white dark:bg-black text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </main>
  );
}
