"use client";

import { useEffect, useState } from "react";
import TopNav from "@/components/ui/DynamicTopNav";
import MediaGallery from "./MediaGallery";
import PackagesModal from "./PackagesModal";
import ServiceDetailsSkeleton from "./ServiceDetailsSkeleton";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import TiptapPageView from "@/components/TiptapPageView";
import { axiosInstance } from "@/utils/axiosInstance";
import { ChevronDown, X } from "lucide-react";
import type { Package, Service } from "./types";

const card =
  "bg-white dark:bg-[#262a31] border border-gray-100 dark:border-white/10 rounded-2xl";

export default function ServiceDetailsPage() {
  const { id } = useParams();
  const serviceId = id as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setReferralCode } = useCustomerAuth();

  const [service, setService] = useState<Service | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [packagesOpen, setPackagesOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  /* ---------- Affiliate tracking ---------- */
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (!ref) return;

    setReferralCode(ref);

    const trackedKey = `affiliate_click_${ref}_${serviceId}`;
    if (sessionStorage.getItem(trackedKey)) return;

    async function trackClick() {
      try {
        await axiosInstance.post("/api/affiliate-clicks/", {
          referral_code: ref,
          service_id: serviceId,
          referrer: document.referrer || null,
        });
        sessionStorage.setItem(trackedKey, "1");
      } catch (err) {
        console.error("Affiliate click tracking failed", err);
      }
    }

    trackClick();
  }, [searchParams, serviceId, setReferralCode]);

  /* ---------- Fetch service ---------- */
  useEffect(() => {
    async function fetchService() {
      try {
        const res = await axiosInstance.get(
          `/api/web-services/${serviceId}/full`,
        );
        const data = res.data;

        const order = ["Basic", "Standard", "Premium"];
        const sortedPackages: Package[] = [...(data.packages || [])].sort(
          (a: Package, b: Package) =>
            order.indexOf(a.type) - order.indexOf(b.type),
        );

        setService({
          ...data,
          packages: sortedPackages,
          media: data.media || [],
          extras: data.extras || [],
          faqs: data.faqs || [],
        });

        const basicPkg = sortedPackages.find((p) => p.type === "Basic");
        setSelectedPackage(basicPkg || sortedPackages[0] || null);
      } catch (err) {
        console.error("Failed to fetch service", err);
      } finally {
        setLoading(false);
      }
    }

    fetchService();
  }, [serviceId]);

  const toggleExtra = (extraId: string) =>
    setSelectedExtras((prev) =>
      prev.includes(extraId)
        ? prev.filter((x) => x !== extraId)
        : [...prev, extraId],
    );

  if (loading) return <ServiceDetailsSkeleton />;

  if (!service)
    return (
      <div className="min-h-screen bg-white dark:bg-[#1f2228] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex items-center justify-center w-16 h-16 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#262a31]">
            <X className="w-6 h-6 text-gray-500 dark:text-gray-300" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Service not found
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            The service may have been removed or the link is incorrect.
          </p>
          <button
            onClick={() => router.push("/services")}
            className="mt-6 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors"
          >
            Browse services
          </button>
        </div>
      </div>
    );

  const hasPackages = service.packages.length > 0;

  const extrasTotal =
    service.extras
      ?.filter((e) => selectedExtras.includes(e.id))
      .reduce((sum, e) => sum + e.price, 0) || 0;
  const totalPrice = (selectedPackage?.price || 0) + extrasTotal;

  const goCheckout = () => {
    if (!selectedPackage) return;
    router.push(
      `/service-checkout?serviceId=${service.id}&packageId=${selectedPackage.id}&extras=${selectedExtras.join(",")}`,
    );
  };

  return (
    <div className="bg-white dark:bg-[#1f2228] min-h-screen text-gray-900 dark:text-white transition-colors pb-28">
      <TopNav title="Service Details" />

      {galleryOpen && service.media && (
        <MediaGallery
          media={service.media}
          startIndex={galleryIndex}
          onClose={() => setGalleryOpen(false)}
        />
      )}

      {selectedPackage && (
        <PackagesModal
          open={packagesOpen}
          onClose={() => setPackagesOpen(false)}
          packages={service.packages}
          selected={selectedPackage}
          onSelect={setSelectedPackage}
          extras={service.extras}
          selectedExtras={selectedExtras}
          toggleExtra={toggleExtra}
          total={totalPrice}
          onContinue={goCheckout}
        />
      )}

      {/* Media strip */}
      {service.media?.length ? (
        <div className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory py-4 px-4 md:px-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/20 scrollbar-track-transparent">
          {service.media.map((m, i) => (
            <button
              type="button"
              key={m.id}
              aria-label={`Open media ${i + 1}`}
              className="shrink-0 snap-start w-72 md:w-96 h-52 md:h-72 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 bg-gray-100 dark:bg-white/5 cursor-pointer transition hover:shadow-md hover:border-gray-200 dark:hover:border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
              onClick={() => {
                setGalleryIndex(i);
                setGalleryOpen(true);
              }}
            >
              {m.image_url && (
                <img
                  src={m.image_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
              {m.video_url && (
                <video
                  src={m.video_url}
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      ) : null}

      {/* Details */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 mt-2 md:mt-4 space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold leading-snug">
            {service.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {service.category}
            {service.subcategory ? ` / ${service.subcategory}` : ""}
          </p>
        </div>

        <div className="text-gray-600 dark:text-gray-300">
          <h2 className="font-semibold mb-2 text-lg text-gray-900 dark:text-white">
            About this service
          </h2>
          <TiptapPageView value={service.description ?? ""} />
        </div>

        {service.faqs?.length ? (
          <div className={`${card} p-4 sm:p-5`}>
            <button
              type="button"
              aria-expanded={faqOpen}
              onClick={() => setFaqOpen(!faqOpen)}
              className="flex items-center justify-between w-full text-left font-semibold text-gray-900 dark:text-white"
            >
              Frequently asked questions
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform ${faqOpen ? "rotate-180" : ""}`}
              />
            </button>

            {faqOpen && (
              <div className="mt-4 space-y-2">
                {service.faqs.map((faq) => {
                  const open = openFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="border border-gray-100 dark:border-white/10 rounded-xl"
                    >
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setOpenFaqId(open ? null : faq.id)}
                        className="flex justify-between items-center gap-3 w-full p-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-200"
                      >
                        {faq.question}
                        <ChevronDown
                          className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                        />
                      </button>
                      {open && (
                        <p className="px-3 pb-3 text-sm text-gray-600 dark:text-gray-400">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Fixed Continue button — bottom left, all devices */}
      {hasPackages && (
        <button
          type="button"
          onClick={() => setPackagesOpen(true)}
          className="fixed z-30 left-4 sm:left-6 bottom-[max(1rem,env(safe-area-inset-bottom))]
            rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-sm font-semibold
            shadow-lg shadow-orange-500/20 transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1f2228]"
        >
          Continue
        </button>
      )}
    </div>
  );
}
