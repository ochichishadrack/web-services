// app/portfolio/[id]/page.tsx

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import portfolioItems from "@/data/portfolioData";
import { ArrowLeft, ArrowUpRight, CheckCircle2, Play } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { id } = await params;

  const item = portfolioItems.find((p) => p.id === id);

  if (!item) {
    notFound();
  }

  const images = item.gallery?.filter((g) => g.type === "image") ?? [];

  const videos = item.gallery?.filter((g) => g.type === "video") ?? [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Banner */}
      <div className="relative h-72 md:h-96 w-full overflow-hidden">
        <Image
          src={item.image_url}
          alt={item.title}
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-orange-400 text-sm font-medium">
              {item.category}
            </span>

            {item.status && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/90 bg-white/10 border border-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {item.status}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white max-w-3xl">
            {item.title}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </Link>

          {/* Desktop Live Site Link */}
          {item.liveUrl && (
            <a
              href={item.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
              Visit live site
              <ArrowUpRight className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-3 gap-10">
          {/* Main Column */}
          <div className="md:col-span-2 space-y-10">
            {/* Project Overview */}
            <div>
              <h2 className="text-xl font-semibold mb-3">Project Overview</h2>

              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Key Features */}
            <div>
              <h2 className="text-xl font-semibold mb-3">Key Features</h2>

              <ul className="space-y-2">
                {item.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-gray-600 dark:text-gray-400"
                  >
                    <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />

                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Results */}
            <div>
              <h2 className="text-xl font-semibold mb-3">Results</h2>

              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {item.results}
              </p>
            </div>

            {/* Gallery */}
            {images.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Gallery</h2>

                <div className="grid grid-cols-2 gap-3">
                  {images.map((shot, i) => (
                    <figure
                      key={i}
                      className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
                    >
                      <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-900">
                        <Image
                          src={shot.url}
                          alt={shot.caption ?? item.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {shot.caption && (
                        <figcaption className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                          {shot.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </div>
            )}

            {/* Video Walkthrough */}
            {videos.length > 0 &&
              videos.map((clip, i) => (
                <div key={i}>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Play className="w-5 h-5 text-orange-500" />
                    Walkthrough
                  </h2>

                  <video
                    controls
                    className="w-full rounded-2xl border border-gray-200 dark:border-gray-800"
                    src={clip.url}
                  />

                  {clip.caption && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {clip.caption}
                    </p>
                  )}
                </div>
              ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Information */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4">
              {/* Client */}
              <div>
                <p className="text-xs text-gray-500">Client</p>

                <p className="font-medium">{item.client}</p>
              </div>

              {/* Budget */}
              <div>
                <p className="text-xs text-gray-500">Budget</p>

                <p className="font-medium">{item.budget}</p>
              </div>

              {/* Duration */}
              <div>
                <p className="text-xs text-gray-500">Duration</p>

                <p className="font-medium">{item.duration}</p>
              </div>

              {/* Mobile Live Site Link */}
              {item.liveUrl && (
                <a
                  href={item.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:hidden flex items-center justify-center gap-1.5 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2.5 rounded-full hover:opacity-90 transition-opacity"
                >
                  Visit live site
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              )}

              {/* Technologies */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Technologies</p>

                <div className="flex flex-wrap gap-2">
                  {item.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Deployment */}
            {item.deployment && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4">
                <p className="text-sm font-semibold">Deployment</p>

                <div className="space-y-3 text-sm">
                  {/* Frontend */}
                  {item.deployment.frontend && (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-500">Frontend</span>

                      <span className="font-medium text-gray-700 dark:text-gray-300 text-right">
                        {item.deployment.frontend}
                      </span>
                    </div>
                  )}

                  {/* Backend */}
                  {item.deployment.backend && (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-500">Backend</span>

                      <span className="font-medium text-gray-700 dark:text-gray-300 text-right">
                        {item.deployment.backend}
                      </span>
                    </div>
                  )}

                  {/* Database */}
                  {item.deployment.database && (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-500">Database</span>

                      <span className="font-medium text-gray-700 dark:text-gray-300 text-right">
                        {item.deployment.database}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
