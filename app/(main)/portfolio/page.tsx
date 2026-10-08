"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Filter,
  Search,
  LayoutGrid,
  List,
  Star,
  ExternalLink,
  Loader2,
  X,
  Code2,
  Globe,
  Layers,
} from "lucide-react";
import { axiosInstance } from "@/utils/axiosInstance";
import type { PortfolioListOut, PortfolioMedia } from "@/types/portfolio";

interface PortfolioListResponse {
  total: number;
  skip: number;
  limit: number;
  items: PortfolioListOut[];
}

type ViewMode = "grid" | "list";
type SortKey = "newest" | "featured" | "title";

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  marketplace: {
    label: "Marketplace",
    color: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  },
  ecommerce: {
    label: "E-commerce",
    color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  real_estate: {
    label: "Real Estate",
    color: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  },
  hospital: {
    label: "Hospital",
    color: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  },
  clinic: {
    label: "Clinic",
    color: "bg-pink-500/15 text-pink-600 dark:text-pink-400",
  },
  pharmacy: {
    label: "Pharmacy",
    color: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  },
  fitness: {
    label: "Fitness",
    color: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  },
  events: {
    label: "Events",
    color: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  travel: {
    label: "Travel",
    color: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  },
  "Programming & Tech": {
    label: "Programming & Tech",
    color: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  },
  website: {
    label: "Website",
    color: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  saas: {
    label: "SaaS",
    color: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400",
  },
};

function categoryBadge(cat?: string | null) {
  if (!cat) return null;
  const meta = CATEGORY_META[cat] ?? {
    label: cat.replace(/_/g, " "),
    color: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide capitalize ${meta.color}`}
    >
      {meta.label}
    </span>
  );
}

function coverOf(item: PortfolioListOut): PortfolioMedia | null {
  return item.primary_media ?? null;
}

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioListOut[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [view, setView] = useState<ViewMode>("grid");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number | boolean> = {
        skip: 0,
        limit: 50,
        is_active: true,
      };
      if (category !== "all") params.category = category;
      if (featuredOnly) params.is_featured = true;

      const res = await axiosInstance.get<PortfolioListResponse>(
        "/api/portfolios",
        { params },
      );
      setItems(res.data.items ?? []);
      setTotal(res.data.total ?? 0);
    } catch (err) {
      console.error(err);
      setError("Could not load projects. Please try again.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [category, featuredOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = [...items];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.client?.toLowerCase().includes(q) ||
          p.summary?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.subcategory?.toLowerCase().includes(q),
      );
    }

    if (sort === "title") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "featured") {
      list.sort((a, b) => {
        if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
        return (b.sort_order ?? 0) - (a.sort_order ?? 0);
      });
    } else {
      list.sort((a, b) => {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (db !== da) return db - da;
        return (b.sort_order ?? 0) - (a.sort_order ?? 0);
      });
    }

    return list;
  }, [items, search, sort]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((p) => p.category && set.add(p.category));
    Object.keys(CATEGORY_META).forEach((k) => set.add(k));
    return Array.from(set).sort();
  }, [items]);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-100 dark:border-zinc-800/80">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-white dark:from-orange-950/30 dark:via-zinc-950 dark:to-zinc-950 pointer-events-none" />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl dark:bg-orange-500/10" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-orange-300/15 blur-3xl dark:bg-orange-600/10" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-16 pb-14 sm:pt-20 sm:pb-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-1.5 rounded-full border border-orange-200/80 bg-orange-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-orange-600 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400 mb-4">
                <Layers className="h-3.5 w-3.5" />
                Portfolio
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.15]">
                Projects that{" "}
                <span className="text-orange-600 dark:text-orange-400">
                  drive growth
                </span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-zinc-400 leading-relaxed max-w-xl">
                High-performance websites and web applications engineered for
                conversion — e-commerce, real estate, school systems, clinics,
                and more.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/80 px-4 py-2.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80">
                <Code2 className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-lg font-bold leading-none tabular-nums">
                    {total || "—"}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-zinc-500">
                    Projects
                  </p>
                </div>
              </div>
              <Link
                href="/services"
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 transition dark:bg-orange-500 dark:hover:bg-orange-600"
              >
                Explore services
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-zinc-500" />
            <input
              type="search"
              placeholder="Search projects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/80 py-2 pl-9 pr-9 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-orange-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Filter className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-8 pr-8 text-sm outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_META[c]?.label ?? c.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-xl border border-gray-200 bg-white py-2 px-3 text-sm outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="featured">Featured first</option>
              <option value="newest">Newest</option>
              <option value="title">Title A–Z</option>
            </select>

            <button
              type="button"
              onClick={() => setFeaturedOnly((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                featuredOnly
                  ? "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-500/40 dark:bg-orange-500/15 dark:text-orange-400"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
              }`}
            >
              <Star
                className={`h-3.5 w-3.5 ${featuredOnly ? "fill-current" : ""}`}
              />
              Featured
            </button>

            <div className="flex rounded-xl border border-gray-200 p-0.5 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`rounded-lg p-1.5 transition ${
                  view === "grid"
                    ? "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={`rounded-lg p-1.5 transition ${
                  view === "list"
                    ? "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                }`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-gray-500 dark:text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-sm">Loading projects…</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center dark:border-red-900/50 dark:bg-red-950/30">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-4 text-sm font-semibold text-orange-600 hover:underline"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 py-20 text-center dark:border-zinc-700">
            <Globe className="mx-auto h-10 w-10 text-gray-300 dark:text-zinc-600" />
            <p className="mt-3 text-sm font-medium text-gray-600 dark:text-zinc-400">
              No projects match your filters
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("all");
                setFeaturedOnly(false);
              }}
              className="mt-3 text-sm font-semibold text-orange-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : view === "grid" ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </ul>
        ) : (
          <ul className="flex flex-col gap-4">
            {filtered.map((p) => (
              <ProjectRow key={p.id} project={p} />
            ))}
          </ul>
        )}

        {!loading && filtered.length > 0 && (
          <p className="mt-8 text-center text-xs text-gray-400 dark:text-zinc-500">
            Showing {filtered.length}
            {total > filtered.length ? ` of ${total}` : ""} project
            {filtered.length === 1 ? "" : "s"}
          </p>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 to-orange-500 px-6 py-12 sm:px-12 sm:py-14 text-center text-white shadow-xl shadow-orange-500/20 dark:from-orange-600 dark:to-orange-700">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Ready to build something that converts?
              </h2>
              <p className="mt-3 max-w-lg mx-auto text-orange-50/90 text-sm sm:text-base">
                From polished marketing sites to full-stack systems —
                e-commerce, school ERPs, clinics, real estate, and more.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-orange-700 shadow-sm hover:bg-orange-50 transition"
                >
                  View services
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <a
                  href="mailto:maraspot.ke@gmail.com"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 transition"
                >
                  Get a quote
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProjectCard({ project }: { project: PortfolioListOut }) {
  const cover = coverOf(project);
  const href = `/portfolios/${project.slug || project.id}`;

  return (
    <li className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-orange-500/40">
      <Link
        href={href}
        className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-zinc-800"
      >
        {cover ? (
          cover.media_type === "video" ? (
            <video
              src={cover.url}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <Image
              src={cover.url}
              alt={cover.alt || project.title}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Globe className="h-12 w-12 text-gray-300 dark:text-zinc-600" />
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {project.is_featured && (
            <span className="inline-flex items-center gap-1 rounded-md bg-orange-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
              <Star className="h-3 w-3 fill-current" />
              Featured
            </span>
          )}
        </div>

        {project.year && (
          <span className="absolute right-3 top-3 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {project.year}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {categoryBadge(project.category)}
            <h3 className="mt-2 text-base font-semibold leading-snug text-gray-900 dark:text-white line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">
              <Link href={href}>{project.title}</Link>
            </h3>
          </div>
        </div>

        {project.summary && (
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {project.summary}
          </p>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between gap-2">
          <div className="min-w-0">
            {project.client && (
              <p className="text-xs text-gray-400 dark:text-zinc-500 truncate">
                {project.client}
              </p>
            )}
          </div>
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 shrink-0"
          >
            View
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </li>
  );
}

function ProjectRow({ project }: { project: PortfolioListOut }) {
  const cover = coverOf(project);
  const href = `/portfolio/${project.slug || project.id}`;

  return (
    <li className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-orange-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-orange-500/40">
      <Link
        href={href}
        className="relative aspect-[16/10] sm:aspect-auto sm:w-48 sm:shrink-0 overflow-hidden bg-gray-100 dark:bg-zinc-800"
      >
        {cover ? (
          cover.media_type === "video" ? (
            <video
              src={cover.url}
              className="h-full w-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <Image
              src={cover.url}
              alt={cover.alt || project.title}
              fill
              className="object-cover"
              sizes="200px"
            />
          )
        ) : (
          <div className="flex h-full min-h-[120px] w-full items-center justify-center">
            <Globe className="h-8 w-8 text-gray-300 dark:text-zinc-600" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-center p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          {categoryBadge(project.category)}
          {project.is_featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
              <Star className="h-3 w-3 fill-current" />
              Featured
            </span>
          )}
          {project.year && (
            <span className="text-[11px] text-gray-400 dark:text-zinc-500">
              {project.year}
            </span>
          )}
        </div>

        <h3 className="mt-1.5 text-lg font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">
          <Link href={href}>{project.title}</Link>
        </h3>

        {project.summary && (
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400 line-clamp-2">
            {project.summary}
          </p>
        )}

        <div className="mt-3 flex items-center gap-3 text-xs text-gray-400 dark:text-zinc-500">
          {project.client && <span>{project.client}</span>}
          {project.subcategory && (
            <>
              <span className="text-gray-300 dark:text-zinc-600">·</span>
              <span className="capitalize">{project.subcategory}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center px-4 pb-4 sm:pb-0 sm:pr-5">
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 hover:border-orange-300 hover:text-orange-600 transition dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-orange-500/40 dark:hover:text-orange-400"
        >
          View project
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </li>
  );
}
