"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface TopNavProps {
  title: string;
  showBackButton?: boolean;
}

export default function TopNav({ title, showBackButton = true }: TopNavProps) {
  const router = useRouter();

  return (
    <div className="flex items-center px-4 py-3 bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      {showBackButton && (
        <button
          onClick={() => router.back()}
          className="mr-4 text-gray-700 dark:text-gray-200 hover:text-indigo-600"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
      )}
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
    </div>
  );
}
