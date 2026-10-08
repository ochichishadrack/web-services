"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  Film,
  ImageIcon,
  Loader2,
  Star,
  Calendar,
  User,
  Briefcase,
  Code2,
  CheckCircle2,
} from "lucide-react";
import { axiosInstance } from "@/utils/axiosInstance";
import type { Portfolio, PortfolioMedia } from "@/types/portfolio";

export default function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeMedia, setActiveMedia] = useState<PortfolioMedia | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      let res;
      if (/^\d+$/.test(slug)) {
        res = await axiosInstance.get<Portfolio>(`/api/portfolios/${slug}`);
      } else {
        res = await axiosInstance.get<Portfolio>(
          `/api/portfolios/slug/${slug}`,
        );
      }
      setPortfolio(res.data);
      const media = res.data.media || [];
      const primary =
        media.find((m) => m.is_primary) ||
        media.slice().sort((a, b) => a.sort_order - b.sort_order)[0] ||
        null;
      setActiveMedia(primary);
    } catch {
      setError(true);
      setPortfolio(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-zinc-950 px-4">
        <p className="text-gray-500 dark:text-zinc-400">Project not found.</p>
        <Link
          href="/portfolios"
          className="text-sm font-semibold text-orange-600 hover:underline"
        >
          ← Back to portfolio
        </Link>
      </div>
    );
  }

  const sortedMedia = (portfolio.media || [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);

  const techStack = portfolio.tech_stack || [];
  const features = portfolio.features || [];

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors">
      <div className="border-b border-gray-100 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4">
          <Link
            href="/portfolios"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            All projects
          </Link>
        </div>
      </div>

      <article className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
        <header className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {portfolio.is_featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
                <Star className="h-3 w-3 fill-current" />
                Featured
              </span>
            )}
            {portfolio.category && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-gray-600 dark:bg-zinc-800 dark:text-zinc-400">
                {portfolio.category.replace(/_/g, " ")}
              </span>
            )}
            {portfolio.subcategory && (
              <span className="rounded-full bg-gray-50 px-2.5 py-0.5 text-[11px] capitalize text-gray-500 dark:bg-zinc-900 dark:text-zinc-500">
                {portfolio.subcategory}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-tight text-gray-900 dark:text-white">
            {portfolio.title}
          </h1>

          {portfolio.summary && (
            <p className="mt-4 text-lg text-gray-600 dark:text-zinc-400 leading-relaxed">
              {portfolio.summary}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 dark:text-zinc-400">
            {portfolio.client && (
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {portfolio.client}
              </span>
            )}
            {portfolio.role && (
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                {portfolio.role}
              </span>
            )}
            {portfolio.year && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {portfolio.year}
              </span>
            )}
            {portfolio.live_url && (
              <a
                href={portfolio.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Live site
              </a>
            )}
          </div>
        </header>

        {sortedMedia.length > 0 && (
          <section className="mt-10">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
              {activeMedia ? (
                activeMedia.media_type === "video" ? (
                  <video
                    key={activeMedia.id}
                    src={activeMedia.url}
                    className="h-full w-full object-contain"
                    controls
                    playsInline
                  />
                ) : (
                  <Image
                    key={activeMedia.id}
                    src={activeMedia.url}
                    alt={activeMedia.alt || portfolio.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    priority
                  />
                )
              ) : null}
            </div>

            {sortedMedia.length > 1 && (
              <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {sortedMedia.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => setActiveMedia(m)}
                      className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                        activeMedia?.id === m.id
                          ? "border-orange-500 ring-2 ring-orange-500/30"
                          : "border-transparent hover:border-gray-300 dark:hover:border-zinc-600"
                      }`}
                    >
                      {m.media_type === "video" ? (
                        <video
                          src={m.url}
                          className="h-full w-full object-cover"
                          muted
                        />
                      ) : (
                        <Image
                          src={m.url}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      )}
                      {m.is_primary && (
                        <span className="absolute left-1 top-1 rounded bg-orange-600 px-1 py-px text-[8px] font-bold uppercase text-white">
                          Primary
                        </span>
                      )}
                      <span className="absolute bottom-1 right-1 rounded bg-black/50 p-0.5 text-white">
                        {m.media_type === "video" ? (
                          <Film className="h-3 w-3" />
                        ) : (
                          <ImageIcon className="h-3 w-3" />
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_280px]">
          <div className="space-y-10">
            {portfolio.challenge && (
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-3">
                  Challenge
                </h2>
                <p className="text-gray-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                  {portfolio.challenge}
                </p>
              </section>
            )}

            {portfolio.solution && (
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-3">
                  Solution
                </h2>
                <p className="text-gray-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                  {portfolio.solution}
                </p>
              </section>
            )}

            {portfolio.results && (
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-3">
                  Results
                </h2>
                <p className="text-gray-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                  {portfolio.results}
                </p>
              </section>
            )}

            {features.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-4">
                  Key features
                </h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-700 dark:text-zinc-300"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-orange-500 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            {techStack.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-5 dark:border-zinc-800 dark:bg-zinc-900/80">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-3">
                  <Code2 className="h-3.5 w-3.5" />
                  Tech stack
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {techStack.map((t, i) => (
                    <span
                      key={i}
                      className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {portfolio.live_url && (
              <a
                href={portfolio.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 transition dark:bg-orange-500 dark:hover:bg-orange-600"
              >
                Visit live site
                <ArrowUpRight className="h-4 w-4" />
              </a>
            )}

            <Link
              href="/portfolios"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-orange-300 hover:text-orange-600 transition dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-orange-500/40 dark:hover:text-orange-400"
            >
              <ArrowLeft className="h-4 w-4" />
              More projects
            </Link>
          </aside>
        </div>
      </article>

      <section className="border-t border-gray-100 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Want something similar?
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            Let’s build a high-performing site or system for your business.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 transition"
            >
              View services
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <a
              href="mailto:maraspot.ke@gmail.com"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-orange-300 hover:text-orange-600 transition dark:border-zinc-700 dark:text-zinc-300"
            >
              Get a quote
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
