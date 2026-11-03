"use client";

import { JSX, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import TopNav from "@/components/navigation/TopNav";
import Footer from "@/components/ui/Footer";
import Reveal from "@/components/ui/Reveal";
import { useLocalCurrency } from "@/hooks/useLocalCurrency";
import { ChevronDown } from "lucide-react";
import type { Service, ServiceMedia, ServicePrices } from "@/lib/services";

type PriceSort = "default" | "asc" | "desc";

/* ---------------- FILTER SELECT ---------------- */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}): JSX.Element {
  return (
    <div className="relative">
      <label className="sr-only">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="appearance-none pl-3.5 pr-9 py-2 text-sm font-medium
          bg-white dark:bg-[#262a31]
          border border-gray-200 dark:border-white/10
          rounded-xl
          text-gray-700 dark:text-gray-200
          hover:border-gray-300 dark:hover:border-white/20
          focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500
          transition-colors cursor-pointer min-w-[9.5rem]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
    </div>
  );
}

/* ---------------- COMPONENT ---------------- */

const GRID_COLUMNS = 4; // matches lg:grid-cols-4, used to stagger each row
const STAGGER_MS = 150;

export default function ServicesClient({
  initialServices,
  initialPrices,
}: {
  initialServices: Service[];
  initialPrices: ServicePrices;
}): JSX.Element {
  // Data now arrives from the server component, so no client-side fetching
  const services = initialServices;
  const prices = initialPrices;
  const { format, loading: fxLoading } = useLocalCurrency();

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priceSort, setPriceSort] = useState<PriceSort>("default");

  const categories = useMemo(() => {
    const set = new Set(
      services.map((s) => s.category).filter(Boolean) as string[],
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [services]);

  const getPrice = (serviceId: string): number | null => {
    const priceData = prices[serviceId];
    if (!priceData) return null;
    const value = priceData?.basic ?? priceData?.min ?? null;
    return typeof value === "number" ? value : null;
  };

  const filteredServices = useMemo(() => {
    let list = [...services];

    if (categoryFilter !== "all") {
      list = list.filter((s) => s.category === categoryFilter);
    }

    if (priceSort === "asc" || priceSort === "desc") {
      list.sort((a, b) => {
        const pa = getPrice(a.id);
        const pb = getPrice(b.id);
        // Push items without price to the end
        if (pa == null && pb == null) return 0;
        if (pa == null) return 1;
        if (pb == null) return -1;
        return priceSort === "asc" ? pa - pb : pb - pa;
      });
    }

    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services, categoryFilter, priceSort, prices]);

  const hasServices = services.length > 0;
  const hasFiltered = filteredServices.length > 0;

  const categoryOptions = [
    { value: "all", label: "All categories" },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  const priceOptions = [
    { value: "default", label: "Sort by price" },
    { value: "asc", label: "Price: Low to High" },
    { value: "desc", label: "Price: High to Low" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#1f2228] transition-colors">
      {/* Top Navigation */}
      <TopNav activePage="services" />

      {/* NOTE: <section>, not <main>, because the root layout already renders <main> */}
      <section className="mx-auto max-w-11xl px-4 md:px-6 py-8 md:py-12">
        {/* Page heading (single H1 for SEO) + filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Web &amp; Software Development Services
            </h1>
            <p className="mt-1 text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl">
              Websites, web apps and custom software built to be fast, secure
              and ready to rank.
            </p>
          </div>

          {hasServices && (
            <Reveal>
              <div className="flex flex-wrap items-center gap-2.5">
                <FilterSelect
                  label="Filter by category"
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  options={categoryOptions}
                />
                <FilterSelect
                  label="Sort by price"
                  value={priceSort}
                  onChange={(v) => setPriceSort(v as PriceSort)}
                  options={priceOptions}
                />
              </div>
            </Reveal>
          )}
        </div>

        {/* Empty: no services at all */}
        {!hasServices && (
          <div className="min-h-[40vh] flex items-center justify-center text-gray-500 dark:text-gray-400">
            No services available.
          </div>
        )}

        {/* Empty: filters match nothing */}
        {hasServices && !hasFiltered && (
          <div className="min-h-[30vh] flex flex-col items-center justify-center gap-3 text-gray-500 dark:text-gray-400">
            <p>No services match your filters.</p>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter("all");
                setPriceSort("default");
              }}
              className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Data */}
        {hasFiltered && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 items-stretch">
            {filteredServices.map((service, i) => {
              const coverMedia: ServiceMedia =
                service.media?.find((m: ServiceMedia) => m.is_cover) || {};
              const hasVideo = !!coverMedia.video_url;
              const hasImage = !!coverMedia.image_url || !!service.cover_image;
              const price = getPrice(service.id);

              return (
                <Reveal
                  key={service.id}
                  delay={(i % GRID_COLUMNS) * STAGGER_MS}
                  className="h-full"
                >
                  <Link
                    href={`/services/${service.id}`}
                    className="group block h-full"
                  >
                    <div className="h-full flex flex-col bg-white dark:bg-[#262a31] border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden transition hover:shadow-md hover:border-gray-200 dark:hover:border-white/20">
                      {/* MEDIA */}
                      <div className="relative w-full aspect-4/3 bg-gray-100 dark:bg-white/5 overflow-hidden shrink-0">
                        {hasVideo ? (
                          <video
                            src={coverMedia.video_url ?? undefined}
                            className="object-cover w-full h-full"
                            muted
                            loop
                            playsInline
                            preload="none"
                            aria-label={service.title}
                          />
                        ) : hasImage ? (
                          <Image
                            src={coverMedia.image_url || service.cover_image!}
                            alt={`${service.title} - ${service.category}`}
                            fill
                            // First row is above the fold: load eagerly for better LCP
                            priority={i < GRID_COLUMNS}
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
                      <div className="p-4 flex flex-col flex-1 space-y-2">
                        <h2 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                          {service.title}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {service.category}
                          {service.subcategory
                            ? ` / ${service.subcategory}`
                            : ""}
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
                </Reveal>
              );
            })}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
