"use client";

import { FC } from "react";

interface Extra {
  id: string;
  title: string;
  price: number;
}

interface Props {
  extras?: Extra[];
  selectedExtras: string[];
  toggleExtra: (id: string) => void;
}

const ServiceExtras: FC<Props> = ({ extras, selectedExtras, toggleExtra }) => {
  if (!extras?.length) return null;

  return (
    <div className="border-t pt-3 space-y-2 border-gray-200 dark:border-gray-700">
      <p className="font-semibold text-sm">Add Extra Services</p>

      {extras.map((extra) => {
        const checked = selectedExtras.includes(extra.id);
        return (
          <label
            key={extra.id}
            className="flex justify-between items-center border rounded-lg p-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
          >
            <div className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleExtra(extra.id)}
                className="accent-black dark:accent-white"
              />
              {extra.title}
            </div>
            <span className="font-semibold">
              + KES {extra.price.toLocaleString()}
            </span>
          </label>
        );
      })}
    </div>
  );
};

export default ServiceExtras;
