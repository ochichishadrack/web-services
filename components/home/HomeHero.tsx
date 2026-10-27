import { JSX } from 'react';
import Link from 'next/link';

const highlights = [
  'Lightning fast',
  'Secure by default',
  'SEO-ready',
  'Works on every device',
  'Easy to use',
  'Built to scale',
];

export default function HomeHero(): JSX.Element {
  return (
    <section className="relative isolate overflow-hidden bg-white dark:bg-gray-950">
      {/* Decorative background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(249,115,22,0.14),transparent_70%)] dark:bg-[radial-gradient(60%_50%_at_50%_0%,rgba(249,115,22,0.20),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-size-[48px_48px] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_75%)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]"
      />

      <div className="mx-auto flex min-h-[85vh] max-w-4xl flex-col items-center justify-center px-6 py-24 text-center">
        {/* Eyebrow badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
          </span>
          Website design &amp; development
        </div>

        {/* Headline */}
        <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-zinc-900 sm:text-5xl md:text-6xl lg:text-7xl dark:text-white">
          Stop Losing Customers. <span className="text-orange-500">Start Driving Growth.</span>
        </h1>

        {/* Subheading */}
        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-zinc-600 md:text-xl dark:text-zinc-300">
          We build or rebuild your website to be fast, secure and SEO-ready, easy to use on every
          device, and ready to scale with your business.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <Link
            href="/contact"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-600 hover:shadow-orange-500/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 active:scale-[0.98]"
          >
            Get a Free Quote
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white/60 px-7 py-3.5 text-base font-semibold text-zinc-900 backdrop-blur transition hover:border-zinc-400 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 active:scale-[0.98] dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            Explore Services
          </Link>
        </div>

        {/* Highlights */}
        <ul className="mt-14 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {highlights.map((item) => (
            <li key={item} className="inline-flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-orange-500"
                aria-hidden
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
