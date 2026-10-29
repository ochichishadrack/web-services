"use client";

import type { ComponentType } from "react";
import { Boxes, Check, Clock, FileText, RefreshCcw } from "lucide-react";
import { useLocalCurrency } from "@/hooks/useLocalCurrency";
import ServiceExtras from "./ServiceExtras";
import type { Extra, Package } from "./types";

interface Props {
  packages: Package[];
  selected: Package;
  onSelect: (pkg: Package) => void;
  extras?: Extra[];
  selectedExtras: string[];
  toggleExtra: (id: string) => void;
  total: number;
}

interface Stat {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

export default function PackagePanel({
  packages,
  selected,
  onSelect,
  extras = [],
  selectedExtras,
  toggleExtra,
  total,
}: Props) {
  const { format } = useLocalCurrency();

  const pickedExtras = extras.filter((e) => selectedExtras.includes(e.id));
  const days = Number(selected.delivery_days);
  const pages = Number(selected.pages ?? 0);
  const products = Number(selected.products ?? 0);

  const stats: Stat[] = [
    {
      icon: Clock,
      label: "Delivery",
      value: `${days} ${days === 1 ? "day" : "days"}`,
    },
    {
      icon: RefreshCcw,
      label: "Revisions",
      value: String(selected.revisions),
    },
  ];
  if (pages > 0)
    stats.push({ icon: FileText, label: "Pages", value: String(pages) });
  if (products > 0)
    stats.push({ icon: Boxes, label: "Products", value: String(products) });

  return (
    <div className="space-y-5">
      {/* Package switcher */}
      <div
        role="tablist"
        aria-label="Choose a package"
        className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/5"
      >
        {packages.map((pkg) => {
          const active = pkg.id === selected.id;
          return (
            <button
              key={pkg.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(pkg)}
              className={`flex-1 min-w-0 rounded-lg px-2 py-2 text-center transition-colors
                focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40
                ${
                  active
                    ? "bg-white dark:bg-[#363b43] shadow-sm text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              <span className="block text-sm font-semibold truncate">
                {pkg.type}
              </span>
              <span
                className={`block text-xs truncate ${
                  active
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {format(pkg.price)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Package title + description */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {selected.name}
        </h3>
        {selected.description && (
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {selected.description}
          </p>
        )}
      </div>

      {/* Quick facts */}
      <dl className="grid grid-cols-2 gap-2">
        {stats.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50/70 dark:bg-white/5 px-3 py-2.5"
          >
            <Icon className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
            <div className="min-w-0">
              <dt className="text-[11px] text-gray-500 dark:text-gray-400">
                {label}
              </dt>
              <dd className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {value}
              </dd>
            </div>
          </div>
        ))}
      </dl>

      {/* What's included */}
      {!!selected.features?.length && (
        <div className="border-t border-gray-100 dark:border-white/10 pt-4 space-y-2.5">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            What’s included
          </h4>
          <ul className="space-y-2">
            {selected.features.map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300"
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/30">
                  <Check
                    className="h-3 w-3 text-green-600 dark:text-green-400"
                    strokeWidth={3}
                  />
                </span>
                <span className="min-w-0">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Extras */}
      {!!extras.length && (
        <div className="border-t border-gray-100 dark:border-white/10 pt-4">
          <ServiceExtras
            extras={extras}
            selectedExtras={selectedExtras}
            toggleExtra={toggleExtra}
          />
        </div>
      )}

      {/* Order summary */}
      <div className="border-t border-gray-100 dark:border-white/10 pt-4 space-y-1.5 text-sm">
        <div className="flex justify-between gap-3 text-gray-600 dark:text-gray-400">
          <span className="truncate">{selected.type} package</span>
          <span className="shrink-0">{format(selected.price)}</span>
        </div>
        {pickedExtras.map((e) => (
          <div
            key={e.id}
            className="flex justify-between gap-3 text-gray-600 dark:text-gray-400"
          >
            <span className="truncate">{e.title}</span>
            <span className="shrink-0">{format(e.price)}</span>
          </div>
        ))}
        <div className="flex justify-between gap-3 pt-2 font-semibold text-gray-900 dark:text-white">
          <span>Total</span>
          <span>{format(total)}</span>
        </div>
      </div>
    </div>
  );
}
