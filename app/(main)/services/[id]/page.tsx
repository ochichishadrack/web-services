"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TopNav from "@/components/ui/DynamicTopNav";
import MediaGallery from "./MediaGallery";
import ServiceExtras from "./ServiceExtras";
import TiptapPageView from "@/components/TiptapPageView";
import { axiosInstance } from "@/utils/axiosInstance";
import {
  Check,
  Clock,
  RefreshCcw,
  FileText,
  Boxes,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";

interface Media {
  id: string;
  image_url?: string;
  video_url?: string;
  is_cover?: boolean;
}
interface Extra {
  id: string;
  title: string;
  price: number;
}
interface Package {
  id: string;
  name: string;
  description?: string;
  price: number;
  delivery_days: number;
  revisions: number | string;
  pages?: number | string;
  products?: number | string;
  features?: string[];
  type: string;
}
interface FAQ {
  id: string;
  question: string;
  answer: string;
}
interface Service {
  id: string;
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  packages: Package[];
  media?: Media[];
  extras?: Extra[];
  faqs?: FAQ[];
}

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`bg-gray-100 dark:bg-gray-800 animate-pulse rounded transition-colors ${className}`}
    />
  );
}

function ServiceDetailsSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen text-gray-900 dark:text-white transition-colors">
      {/* Top spacing (matches TopNav layout) */}
      <div className="h-16" />

      {/* Media horizontal scroll */}
      <div className="flex gap-4 overflow-hidden py-4 px-4 md:px-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock
            key={i}
            className="w-80 md:w-96 h-60 md:h-72 rounded-xl shrink-0"
          />
        ))}
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4 md:mt-6">
        {/* LEFT CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <SkeletonBlock className="h-8 w-2/3 mb-2" />
            <SkeletonBlock className="h-4 w-1/3" />
          </div>

          {/* About section */}
          <div className="px-2 py-5">
            <SkeletonBlock className="h-6 w-40 mb-4" />
            <SkeletonBlock className="h-4 w-full mb-2" />
            <SkeletonBlock className="h-4 w-full mb-2" />
            <SkeletonBlock className="h-4 w-5/6" />
          </div>

          {/* FAQ card */}
          <div className="border rounded-xl p-5 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm">
            <SkeletonBlock className="h-6 w-1/2 mb-4" />
            <SkeletonBlock className="h-4 w-full mb-2" />
            <SkeletonBlock className="h-4 w-full mb-2" />
            <SkeletonBlock className="h-4 w-3/4" />
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="sticky top-6 h-fit border rounded-2xl shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <SkeletonBlock className="h-10 flex-1" />
            <SkeletonBlock className="h-10 flex-1" />
            <SkeletonBlock className="h-10 flex-1" />
          </div>

          {/* Package content */}
          <div className="p-6 space-y-4">
            <SkeletonBlock className="h-8 w-1/2" />
            <SkeletonBlock className="h-4 w-2/3" />
            <SkeletonBlock className="h-4 w-full" />

            <div className="space-y-2 pt-3">
              <SkeletonBlock className="h-4 w-3/4" />
              <SkeletonBlock className="h-4 w-2/3" />
              <SkeletonBlock className="h-4 w-1/2" />
            </div>

            {/* Features list */}
            <div className="border-t pt-3 space-y-2">
              <SkeletonBlock className="h-4 w-1/3 mb-2" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-5/6" />
            </div>

            {/* CTA */}
            <SkeletonBlock className="h-12 w-full rounded-lg mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServiceDetailsPage() {
  const { id } = useParams();
  const serviceId = id as string;
  const router = useRouter();

  const [service, setService] = useState<Service | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [faqOpen, setFaqOpen] = useState(false);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    async function fetchService() {
      try {
        const res = await axiosInstance.get(
          `/api/web-services/${serviceId}/full`,
        );
        const data = res.data;

        const order = ["Basic", "Standard", "Premium"];

        const sortedPackages: Package[] = (data.packages || []).sort(
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

        // Always select BASIC if it exists
        const basicPkg: Package | undefined = sortedPackages.find(
          (p: Package) => p.type === "Basic",
        );
        setSelectedPackage(basicPkg || sortedPackages[0] || null);
      } finally {
        setLoading(false);
      }
    }

    fetchService();
  }, [serviceId]);

  const toggleExtra = (extraId: string) =>
    setSelectedExtras((prev) =>
      prev.includes(extraId)
        ? prev.filter((id) => id !== extraId)
        : [...prev, extraId],
    );

  if (loading) return <ServiceDetailsSkeleton />;
  if (!service)
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex items-center justify-center w-16 h-16 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
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
            className="mt-6 px-5 py-2.5 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-900 transition"
          >
            Browse Services
          </button>
        </div>
      </div>
    );

  const extrasTotal =
    service.extras
      ?.filter((e) => selectedExtras.includes(e.id))
      .reduce((sum, e) => sum + e.price, 0) || 0;
  const totalPrice = (selectedPackage?.price || 0) + extrasTotal;

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen text-gray-900 dark:text-white">
      <TopNav title="Service Details" />
      {galleryOpen && service.media && (
        <MediaGallery
          media={service.media}
          startIndex={galleryIndex}
          onClose={() => setGalleryOpen(false)}
        />
      )}

      {/* Media scroll on top */}
      {service.media?.length ? (
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-4 px-4 md:px-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
          {service.media.map((m, i) => (
            <div
              key={m.id}
              className="shrink-0 snap-start w-80 md:w-96 h-60 md:h-72 rounded-xl shadow-lg overflow-hidden border cursor-pointer transform hover:scale-105 transition duration-300"
              onClick={() => {
                setGalleryIndex(i);
                setGalleryOpen(true);
              }}
            >
              {m.image_url && (
                <img
                  src={m.image_url}
                  alt="media"
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
            </div>
          ))}
        </div>
      ) : null}

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4 md:mt-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{service.title}</h1>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {service.category}
              {service.subcategory ? ` / ${service.subcategory}` : ""}
            </p>
          </div>

          <div className="px-2 py-5 text-gray-600 dark:text-gray-300">
            <h2 className="font-semibold mb-2 text-lg text-gray-800 dark:text-gray-100">
              About this service
            </h2>
            <TiptapPageView value={service.description ?? ""} />
          </div>

          {service.faqs?.length ? (
            <div className="border rounded-xl p-5 bg-white dark:bg-gray-900 shadow-sm border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setFaqOpen(!faqOpen)}
                className="flex items-center text-gray-700 dark:text-gray-300 justify-between w-full font-semibold text-lg"
              >
                Frequently Asked Questions{" "}
                {faqOpen ? <ChevronUp /> : <ChevronDown />}
              </button>
              {faqOpen && (
                <div className="mt-4 space-y-2">
                  {service.faqs.map((faq) => {
                    const open = openFaqId === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className="border rounded-lg border-gray-200 dark:border-gray-700"
                      >
                        <button
                          onClick={() => setOpenFaqId(open ? null : faq.id)}
                          className="flex justify-between items-center w-full p-3 text-sm font-semibold text-gray-700 dark:text-gray-300"
                        >
                          {faq.question}{" "}
                          {open ? <ChevronUp /> : <ChevronDown />}
                        </button>
                        {open && (
                          <p className="p-3 pt-0 text-sm text-gray-600 dark:text-gray-400">
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

        {/* RIGHT SIDEBAR */}
        <div className="sticky top-6 mt-2 h-fit border rounded-2xl shadow-sm bg-white dark:bg-gray-900 overflow-hidden border-gray-200 dark:border-gray-700">
          {/* PACKAGE TABS */}
          <div className="flex border-b bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            {service.packages.map((pkg, index) => (
              <button
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                className={`flex-1 py-3 text-sm font-semibold transition ${
                  selectedPackage?.id === pkg.id
                    ? "border-b-2 text-gray-900 dark:text-white border-black dark:border-white bg-white dark:bg-gray-900"
                    : "text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white"
                }`}
              >
                {pkg.type}
              </button>
            ))}
          </div>

          {/* PACKAGE CONTENT */}
          {selectedPackage && (
            <div className="p-6 space-y-4">
              <div className="text-3xl font-bold">
                KES {totalPrice.toLocaleString()}
              </div>
              <p className="font-semibold">{selectedPackage.name}</p>
              <p className="text-sm">{selectedPackage.description}</p>

              <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-700 dark:text-gray-300 pt-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {selectedPackage.delivery_days} days delivery
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCcw className="w-4 h-4" />
                  {selectedPackage.revisions} revisions
                </div>
                {Number(selectedPackage.pages ?? 0) > 0 && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {Number(selectedPackage.pages)}{" "}
                    {Number(selectedPackage.pages) === 1 ? "page" : "pages"}
                  </div>
                )}
                {Number(selectedPackage.products ?? 0) > 0 && (
                  <div className="flex items-center gap-2">
                    <Boxes className="w-4 h-4" />
                    {Number(selectedPackage.products)}{" "}
                    {Number(selectedPackage.products) === 1
                      ? "product"
                      : "products"}
                  </div>
                )}
              </div>

              {selectedPackage.features?.length && (
                <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-sm border-t pt-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    What’s Included
                  </h3>
                  {selectedPackage.features.map((f, i) => (
                    <li key={i} className="flex gap-2 items-center">
                      <Check className="w-4 h-4 text-green-600" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              {/* Extras */}
              <ServiceExtras
                extras={service.extras}
                selectedExtras={selectedExtras}
                toggleExtra={toggleExtra}
              />

              {/* CTA */}
              <button
                onClick={() =>
                  router.push(
                    `/service-checkout?serviceId=${service.id}&packageId=${selectedPackage.id}&extras=${selectedExtras.join(",")}`,
                  )
                }
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
              >
                Continue →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
