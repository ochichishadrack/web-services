'use client';

import { JSX, useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const highlights = [
  'Lightning fast',
  'Secure by default',
  'SEO-ready',
  'Works on every device',
  'Easy to use',
  'Built to scale',
];

const slides = [
  {
    image: '/hero/0.webp',
    alt: 'Laptop surrounded by different website layouts, representing websites of all kinds',
    title: 'We Deliver Websites',
    accent: 'Of All Kinds',
    text: 'Business sites, online stores, portfolios, booking platforms, blogs and custom web apps: whatever your business needs online, we design, build and launch it.',
  },
  {
    image: '/hero/1.webp',
    alt: 'Developer working on a laptop with a cup of coffee',
    title: 'Code Crafted',
    accent: 'With Care',
    text: 'Clean, maintainable code written by developers who sweat the details, so your site stays fast and easy to grow.',
  },
  {
    image: '/hero/2.webp',
    alt: 'Developer reviewing dashboards and analytics on a large monitor',
    title: 'Dashboards That',
    accent: 'Drive Decisions',
    text: 'Custom admin panels and analytics that turn your data into clear, actionable insight.',
  },
  {
    image: '/hero/3.webp',
    alt: 'Full-stack developer working across two monitors',
    title: 'Full-Stack,',
    accent: 'End to End',
    text: 'From front-end interfaces to back-end APIs and hosting, we handle the whole stack under one roof.',
  },
  {
    image: '/hero/4.webp',
    alt: 'Developer coding on a laptop with code and search icons',
    title: 'SEO-Ready',
    accent: 'From Line One',
    text: 'Semantic markup, fast load times and clean structure so customers can actually find you on Google.',
  },
  {
    image: '/hero/5.webp',
    alt: 'Developer at an organized desk with code on multiple screens',
    title: 'Organized,',
    accent: 'Predictable Delivery',
    text: 'A clear process from planning to launch, with honest timelines and no surprises along the way.',
  },
  {
    image: '/hero/6.webp',
    alt: 'Developer designing wireframes with security and settings icons',
    title: 'Secure',
    accent: 'By Default',
    text: 'Best-practice security, protected data and reliable hosting are built in from day one, never bolted on.',
  },
  {
    image: '/hero/7.webp',
    alt: 'Developer working at a desk on a laptop',
    title: 'Simple For You,',
    accent: 'Powerful Underneath',
    text: 'Easy-to-manage websites that your team can update without calling a developer every time.',
  },
  {
    image: '/hero/8.webp',
    alt: 'Developer with code and a responsive website on multiple screens',
    title: 'Flawless On',
    accent: 'Every Device',
    text: 'Responsive layouts that look and perform perfectly on phones, tablets and desktops.',
  },
] as const;

const INTERVAL_MS = 6000;
const TRANSITION_MS = 500;

type Phase = 'in' | 'out' | 'enter';

export default function HomeHero(): JSX.Element {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('in');
  const [paused, setPaused] = useState(false);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const goTo = useCallback((next: number) => {
    setPhase('out');
    const t1 = setTimeout(() => {
      setIndex(next);
      setPhase('enter');
      const t2 = setTimeout(() => setPhase('in'), 50);
      timeouts.current.push(t2);
    }, TRANSITION_MS);
    timeouts.current.push(t1);
  }, []);

  // Auto-advance (waits until the next slide's image has loaded)
  useEffect(() => {
    const next = (index + 1) % slides.length;
    if (paused || phase !== 'in' || !loaded[next]) return;
    const timer = setTimeout(() => goTo(next), INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [index, paused, phase, loaded, goTo]);

  // Cleanup pending timeouts on unmount
  useEffect(() => {
    const pending = timeouts.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const slide = slides[index];

  const textMotion =
    phase === 'in'
      ? 'translate-x-0 opacity-100'
      : phase === 'out'
        ? '-translate-x-8 opacity-0'
        : 'translate-x-8 opacity-0';

  const imageMotion =
    phase === 'in'
      ? 'translate-x-0 scale-100 opacity-100'
      : phase === 'out'
        ? 'translate-x-8 scale-95 opacity-0'
        : '-translate-x-8 scale-95 opacity-0';

  return (
    <section
      // 4rem = header height. Adjust if your navbar is taller or shorter.
      className="relative flex items-center bg-white lg:min-h-[calc(100svh-4rem)] dark:bg-[#1f2228]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 content-center items-center gap-x-16 gap-y-6 px-6 py-12 lg:grid-cols-2 lg:py-8">
        {/* 1. Title (top on mobile, left column on desktop) */}
        <div className="order-1 flex min-h-[6rem] items-end justify-center text-center lg:col-start-1 lg:row-start-1 lg:min-h-[8rem] lg:justify-start lg:text-left">
          <h1
            aria-live="polite"
            className={`text-3xl font-bold leading-tight text-zinc-900 transition-all duration-500 ease-out motion-reduce:transition-none sm:text-4xl lg:text-5xl dark:text-white ${textMotion}`}
          >
            {slide.title} <span className="text-orange-500">{slide.accent}</span>
          </h1>
        </div>

        {/* 2. Image (under the title on mobile, right column on desktop) */}
        <div className="order-2 flex items-center justify-center lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:justify-center">
          <div
            className={`relative aspect-square w-full max-w-[16rem] transition-all duration-500 ease-out motion-reduce:transition-none sm:max-w-sm lg:w-[min(28rem,60svh)] lg:max-w-none ${imageMotion}`}
          >
            {slides.map((s, i) => (
              <Image
                key={s.image}
                src={s.image}
                alt={i === index ? s.alt : ''}
                aria-hidden={i !== index}
                fill
                priority={i === 0}
                loading="eager"
                onLoad={() => setLoaded((prev) => (prev[i] ? prev : { ...prev, [i]: true }))}
                sizes="(min-width: 1024px) 28rem, (min-width: 640px) 24rem, 16rem"
                className={`object-contain ${i === index ? 'opacity-100' : 'opacity-0'}`}
              />
            ))}
          </div>
        </div>

        {/* 3. Paragraph, CTAs, dots, highlights */}
        <div className="order-3 text-center lg:col-start-1 lg:row-start-2 lg:text-left">
          <p
            className={`mx-auto mb-8 min-h-[7rem] max-w-xl text-lg text-zinc-600 transition-all delay-100 duration-500 ease-out motion-reduce:transition-none md:text-xl lg:mx-0 lg:mb-6 lg:min-h-[7rem] dark:text-zinc-300 ${textMotion}`}
          >
            {slide.text}
          </p>

          {/* CTAs */}
          <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4 lg:justify-start">
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

          {/* Slide indicators */}
          <div className="mt-8 flex items-center justify-center gap-2 lg:mt-6 lg:justify-start">
            {slides.map((s, i) => (
              <button
                key={s.image}
                type="button"
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => i !== index && phase === 'in' && loaded[i] && goTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index
                    ? 'w-8 bg-orange-500'
                    : 'w-2 bg-zinc-300 hover:bg-zinc-400 dark:bg-white/20 dark:hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Highlights (desktop only) */}
          <ul className="mt-6 hidden max-w-xl flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-zinc-600 lg:flex dark:text-zinc-400">
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
      </div>
    </section>
  );
}
