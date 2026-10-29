"use client";

import { FC } from "react";
import { Check } from "lucide-react";
import { useLocalCurrency } from "@/hooks/useLocalCurrency";
import type { Extra } from "./types";

interface Props {
  extras?: Extra[];
  selectedExtras: string[];
  toggleExtra: (id: string) => void;
}

const ServiceExtras: FC<Props> = ({ extras, selectedExtras, toggleExtra }) => {
  const { format } = useLocalCurrency();
  if (!extras?.length) return null;

  return (
    <div className="space-y-2.5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
        Add extras
      </h3>

      <div className="space-y-2">
        {extras.map((extra) => {
          const checked = selectedExtras.includes(extra.id);
          return (
            <label
              key={extra.id}
              className="group flex items-center gap-3 rounded-xl border border-gray-200 dark:border-white/10
                p-3 cursor-pointer transition-colors
                hover:border-gray-300 dark:hover:border-white/20
                has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50/60
                dark:has-[:checked]:border-orange-500/70 dark:has-[:checked]:bg-orange-500/10
                has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-orange-500/30"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleExtra(extra.id)}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-gray-300 dark:border-white/20
                  text-transparent transition-colors
                  peer-checked:border-orange-500 peer-checked:bg-orange-500 peer-checked:text-white"
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span className="flex-1 min-w-0 text-sm text-gray-700 dark:text-gray-200">
                {extra.title}
              </span>
              <span className="shrink-0 text-sm font-semibold text-gray-900 dark:text-white">
                + {format(extra.price)}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceExtras;
