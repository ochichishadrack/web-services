"use client";

import { JSX, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { axiosInstance } from "@/utils/axiosInstance";
import TopNav from "@/components/ui/TopNav";
import Footer from "@/components/ui/Footer";

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
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="relative aspect-4/3 bg-gray-100 dark:bg-gray-800" />
      <div className="p-3 md:p-4 space-y-2">
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

      {/* Hero Section */}
      <section className="relative h-80 md:h-96 flex items-center justify-center text-center text-white overflow-hidden">
        {/* Background Image */}
        <Image
          src="/pages-web.jpeg"
          alt="Web services hero"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content */}
        <div className="relative z-10 px-4 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-3">
            Explore All Our Services
          </h2>
          <p className="text-sm md:text-lg opacity-90">
            Modern, responsive, and scalable web solutions tailored for your
            business.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
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
                  className="group block"
                >
                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden transition hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700">
                    {/* MEDIA */}
                    <div className="relative w-full aspect-4/3 bg-gray-100 dark:bg-gray-800 overflow-hidden">
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

                    {/* CONTENT */}
                    <div className="p-4 space-y-2">
                      <h2 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                        {service.title}
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {service.category}
                        {service.subcategory ? ` / ${service.subcategory}` : ""}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        {service.is_featured ? (
                          <span className="text-[11px] font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-md">
                            Featured
                          </span>
                        ) : (
                          <span />
                        )}
                        {price && (
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            From KES {price.toLocaleString()}
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
