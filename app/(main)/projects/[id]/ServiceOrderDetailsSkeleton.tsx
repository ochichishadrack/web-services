"use client";

import { JSX } from "react";
import TopNav from "@/components/ui/DynamicTopNav";

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
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2 flex-1">
          <Block className="h-6 w-3/4 sm:w-2/3" />
          <Block className="h-4 w-1/2 sm:w-1/3" />
        </div>
        <Block className="h-6 w-24 rounded-full self-start" />
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Block className="h-3 w-24" />
          <Block className="h-8 w-36" />
        </div>
        <div className="space-y-2 text-right">
          <Block className="h-4 w-32 ml-auto" />
          <Block className="h-4 w-28 ml-auto" />
        </div>
      </div>
    </div>
  );
}

/* ---------------- PACKAGE DETAILS ---------------- */

function PackageDetailsSkeleton(): JSX.Element {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
      <Block className="h-6 w-40" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 p-4 space-y-2"
          >
            <Block className="h-3 w-16" />
            <Block className="h-5 w-20" />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Block className="h-4 w-28" />
        <Block className="h-4 w-full" />
        <Block className="h-4 w-5/6" />
      </div>

      <div className="space-y-3">
        <Block className="h-4 w-36" />
        <div className="grid sm:grid-cols-2 gap-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Block key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- PHASES ---------------- */

function PhasesSkeleton(): JSX.Element {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
      <Block className="h-6 w-40 mb-5" />

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 px-4 py-3.5"
          >
            <div className="space-y-2">
              <Block className="h-4 w-28" />
              <Block className="h-3 w-20" />
            </div>
            <Block className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>

      <Block className="h-12 w-full mt-6 rounded-xl" />
    </div>
  );
}

/* ---------------- DELIVERIES ---------------- */

function DeliveriesSkeleton(): JSX.Element {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
      <Block className="h-6 w-32 mb-5" />

      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 p-5 space-y-3"
          >
            <Block className="h-4 w-full" />
            <Block className="h-4 w-4/5" />
            <Block className="h-3 w-28" />
            <Block className="h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- MAIN EXPORT ---------------- */

export default function ServiceOrderDetailsSkeleton(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopNav title="Order Details" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <HeaderSkeleton />
        <PackageDetailsSkeleton />
        <PhasesSkeleton />
        <DeliveriesSkeleton />
      </div>
    </div>
  );
}
