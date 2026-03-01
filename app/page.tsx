"use client";

import { JSX, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  is_featured?: boolean;
  is_active?: boolean;
  cover_image?: string | null;
  media?: ServiceMedia[];
}

/* ---------------- SKELETON ---------------- */

function SkeletonCard(): JSX.Element {
  return (
    <div className="h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="w-full aspect-[4/3] bg-gray-200 dark:bg-gray-800" />
      <div className="p-4 space-y-3">
        <div className="h-4 rounded bg-gray-200 dark:bg-gray-800 w-3/4" />
        <div className="h-3 rounded bg-gray-200 dark:bg-gray-800 w-1/2" />
      </div>
    </div>
  );
}

/* ---------------- COMPONENT ---------------- */

export default function HomePage(): JSX.Element {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // FORCE 3 COL ON REAL DESKTOP WIDTHS
  const gridClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  useEffect(() => {
    async function fetchServices(): Promise<void> {
      try {
        const res = await axiosInstance.get<Service[]>("/api/web-services");

        const featured = (res.data || []).filter(
          (s: Service) => s.is_active && s.is_featured,
        );

        setServices(featured);
      } catch (err) {
        console.error("Failed to fetch services", err);
      } finally {
        setLoading(false);
      }
    }

    void fetchServices();
  }, []);

  const hasServices = useMemo(() => services.length > 0, [services]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
      <TopNav activePage="home" />

      {/* HERO */}
      <section className="relative h-130 md:h-155 flex items-center justify-center text-center text-white">
        <Image
          src="/need-web.jpeg"
          alt="Web Development"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 max-w-2xl px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            We Build Websites That Grow Your Business
          </h1>
          <p className="text-lg md:text-xl mb-6 opacity-90">
            Modern, scalable and high-performance websites built for growth.
          </p>

          <Link
            href="/services"
            className="inline-block px-6 py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Explore Services
          </Link>
        </div>
      </section>

      {/* FEATURED */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-12 min-h-[70vh]">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">Featured Services</h2>

          <Link
            href="/services"
            className="text-blue-600 font-medium hover:underline"
          >
            View All Services →
          </Link>
        </div>

        {/* LOADING — FILLS FULL GRID */}
        {loading && (
          <div className={gridClass}>
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!loading && !hasServices && (
          <div className="min-h-[40vh] flex items-center justify-center text-gray-500">
            No featured services available.
          </div>
        )}

        {/* DATA */}
        {!loading && hasServices && (
          <div className={gridClass}>
            {services.map((service) => {
              const coverMedia = service.media?.find((m) => m.is_cover) || {};

              const hasVideo = !!coverMedia.video_url;
              const hasImage = !!coverMedia.image_url || !!service.cover_image;

              return (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className="group block h-full"
                >
                  <div className="h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden transition hover:shadow-md">
                    <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800 overflow-hidden">
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
                          src={
                            coverMedia.image_url ||
                            service.cover_image ||
                            "/service-placeholder.jpg"
                          }
                          alt={service.title}
                          fill
                          className="object-cover group-hover:scale-[1.02] transition"
                        />
                      ) : (
                        <Image
                          src="/service-placeholder.jpg"
                          alt="Service"
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="text-sm md:text-base font-semibold line-clamp-2">
                        {service.title}
                      </h3>

                      <p className="text-xs text-gray-500">
                        {service.category}
                        {service.subcategory ? ` / ${service.subcategory}` : ""}
                      </p>
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
