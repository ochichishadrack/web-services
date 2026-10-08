"use client";

import { JSX, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { axiosInstance } from "@/utils/axiosInstance";
import TopNav from "@/components/navigation/TopNav";
import Footer from "@/components/ui/Footer";
import { useLocalCurrency } from "@/hooks/useLocalCurrency";

/* ---------------- TYPES ---------------- */

interface ServiceMedia {
  image_url?: string | null;
  video_url?: string | null;
  is_cover?: boolean;
}

interface Service {
  id: string;
  title: string;
  slug: string;
  category: string;
  subcategory?: string;
  description?: string;
  is_featured?: boolean;
  is_active?: boolean;
  cover_image?: string | null;
  media?: ServiceMedia[];
}

/* ---------------- SKELETON CARD ---------------- */

function SkeletonCard(): JSX.Element {
  return (
    <div className="h-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden animate-pulse flex flex-col">
      <div className="relative aspect-4/3 bg-gray-100 dark:bg-gray-800 shrink-0" />
      <div className="p-3 md:p-4 space-y-2 flex-1">
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-4/5" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/5" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/4" />
      </div>
    </div>
  );
}

/* ---------------- COMPONENT ---------------- */

export default function ServicesPage(): JSX.Element {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<Record<string, any>>({});
  const { format, loading: fxLoading } = useLocalCurrency();

  useEffect(() => {
    async function fetchServices(): Promise<void> {
      try {
        const res = await axiosInstance.get<Service[]>("/api/web-services");
        const activeServices = (res.data || []).filter(
          (s: Service) => s.is_active,
        );
        setServices(activeServices);
      } catch (err) {
        console.error("Failed to fetch services", err);
      } finally {
        setLoading(false);
      }
    }
    void fetchServices();
  }, []);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await axiosInstance.get("/api/web-services/prices");
        setPrices(res.data || {});
      } catch {
        console.error("Failed to fetch prices");
      }
    }
    fetchPrices();
  }, []);

  const hasServices = useMemo(() => services.length > 0, [services]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      {/* Top Navigation */}
      <TopNav activePage="services" />

      {/* Hero Section — slightly different bg for distinction */}
      <section className="relative flex items-center justify-center text-center overflow-hidden bg-gray-50 dark:bg-gray-950/70 py-16 md:py-20 border-b border-gray-100 dark:border-gray-800">
        <div className="relative z-10 px-4 max-w-3xl mx-auto">
          <span className="inline-block mb-4 px-3 py-1 text-xs font-medium tracking-wider uppercase bg-white dark:bg-white/10 rounded-full border border-gray-200 dark:border-white/20 text-gray-600 dark:text-gray-300">
            Our Services
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-gray-900 dark:text-white">
            Web Solutions That{" "}
            <span className="text-orange-600 dark:text-orange-400">
              Drive Results
            </span>
          </h2>
        </div>
      </section>

      {/* Services Grid */}
      <main className="mx-auto max-w-9xl px-4 md:px-6 py-8 md:py-12">
        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2  items-stretch">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !hasServices && (
          <div className="min-h-[40vh] flex items-center justify-center text-gray-500 dark:text-gray-400">
            No services available.
          </div>
        )}

        {/* Data */}
        {!loading && hasServices && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 items-stretch">
            {services.map((service) => {
              const coverMedia =
                service.media?.find((m: ServiceMedia) => m.is_cover) || {};
              const hasVideo = !!coverMedia.video_url;
              const hasImage = !!coverMedia.image_url || !!service.cover_image;
              const priceData = prices[service.id];
              const price = priceData?.basic ?? priceData?.min ?? null;

              return (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className="group block h-full"
                >
                  <div className="h-full flex flex-col bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden transition hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700">
                    {/* MEDIA */}
                    <div className="relative w-full aspect-4/3 bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                      {hasVideo ? (
                        <video
                          src={coverMedia.video_url ?? undefined}
                          className="object-cover w-full h-full"
                          muted
                          loop
                          playsInline
                        />
                      ) : hasImage ? (
                        <Image
                          src={coverMedia.image_url || service.cover_image!}
                          alt={service.title}
                          fill
                          sizes="(max-width:768px) 100vw, (max-width:1024px) 33vw, 25vw"
                          className="object-cover group-hover:scale-[1.02] transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          No preview
                        </div>
                      )}
                    </div>

                    {/* CONTENT — grows to fill remaining height */}
                    <div className="p-4 flex flex-col flex-1 space-y-2">
                      <h2 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                        {service.title}
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {service.category}
                        {service.subcategory ? ` / ${service.subcategory}` : ""}
                      </p>

                      <div className="flex items-center justify-between pt-1 mt-auto">
                        {service.is_featured ? (
                          <span className="text-[11px] font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-md">
                            Featured
                          </span>
                        ) : (
                          <span />
                        )}
                        {price != null && (
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {fxLoading ? (
                              "..."
                            ) : (
                              <>
                                <span className="font-normal text-gray-500 dark:text-gray-400 text-xs">
                                  From{" "}
                                </span>
                                {format(price)}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
