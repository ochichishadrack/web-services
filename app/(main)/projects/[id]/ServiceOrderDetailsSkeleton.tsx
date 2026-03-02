"use client";

import { JSX } from "react";

/* ---------------- BASE BLOCK ---------------- */

function Block({ className }: { className: string }): JSX.Element {
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`}
    />
  );
}

/* ---------------- HEADER ---------------- */

function HeaderSkeleton(): JSX.Element {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-3 transition-colors">
      <Block className="h-6 w-2/3" />
      <Block className="h-4 w-1/3" />

      <div className="flex justify-between mt-4">
        <Block className="h-5 w-28" />
        <Block className="h-5 w-20" />
      </div>

      <Block className="h-3 w-32" />
    </div>
  );
}

/* ---------------- FEATURES ---------------- */

function FeaturesSkeleton(): JSX.Element {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm transition-colors">
      <Block className="h-5 w-40 mb-4" />

      <div className="grid sm:grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Block key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

/* ---------------- PHASES ---------------- */

function PhasesSkeleton(): JSX.Element {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm transition-colors">
      <Block className="h-5 w-40 mb-4" />

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 dark:border-gray-800 rounded-lg p-3 space-y-2"
          >
            <Block className="h-4 w-32" />
            <Block className="h-3 w-24" />
          </div>
        ))}
      </div>

      <Block className="h-10 w-full mt-5" />
    </div>
  );
}

/* ---------------- DELIVERIES ---------------- */

function DeliveriesSkeleton(): JSX.Element {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm transition-colors">
      <Block className="h-5 w-40 mb-4" />

      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-2 mb-3"
        >
          <Block className="h-4 w-full" />
          <Block className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

/* ---------------- MAIN EXPORT ---------------- */

export default function ServiceOrderDetailsSkeleton(): JSX.Element {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-6">
        <HeaderSkeleton />
        <FeaturesSkeleton />
        <PhasesSkeleton />
        <DeliveriesSkeleton />
      </div>
    </div>
  );
}
