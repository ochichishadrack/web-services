"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useLocalCurrency } from "@/hooks/useLocalCurrency";
import PackagePanel from "./PackagePanel";
import type { Extra, Package } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  packages: Package[];
  selected: Package;
  onSelect: (pkg: Package) => void;
  extras?: Extra[];
  selectedExtras: string[];
  toggleExtra: (id: string) => void;
  total: number;
  onContinue: () => void;
}

export default function PackagesModal({
  open,
  onClose,
  packages,
  selected,
  onSelect,
  extras,
  selectedExtras,
  toggleExtra,
  total,
  onContinue,
}: Props) {
  const { format } = useLocalCurrency();

  // Lock page scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Choose a package"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Fixed-height sheet (mobile) / dialog (desktop).
          Height never changes, so the footer never moves. */}
      <div
        className="relative flex flex-col w-full sm:max-w-lg
          h-[92dvh] sm:h-[85vh] sm:max-h-[720px]
          bg-white dark:bg-[#262a31]
          border border-gray-100 dark:border-white/10
          rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-gray-100 dark:border-white/10 shrink-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Choose a package
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body — the only part that scrolls */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain [scrollbar-gutter:stable] p-4 sm:p-5">
          <PackagePanel
            packages={packages}
            selected={selected}
            onSelect={onSelect}
            extras={extras}
            selectedExtras={selectedExtras}
            toggleExtra={toggleExtra}
            total={total}
          />
        </div>

        {/* Footer — pinned to the bottom */}
        <div className="shrink-0 flex items-center gap-4 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-[#262a31] px-4 sm:px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Total
            </div>
            <div className="text-lg font-bold leading-tight text-gray-900 dark:text-white">
              {format(total)}
            </div>
          </div>
          <button
            type="button"
            onClick={onContinue}
            className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
