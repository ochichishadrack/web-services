'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface DynamicTopNavProps {
  title: string;
  showBack?: boolean; // optional, defaults to true
}

export default function DynamicTopNav({ title, showBack = true }: DynamicTopNavProps) {
  const router = useRouter();

  return (
    <header
      className="
        sticky top-0 z-50 backdrop-blur-md 
        bg-white/80 dark:bg-gray-900 
        border-b border-gray-200/60 dark:border-gray-700/60 
        px-1 py-2 flex items-center gap-3 shadow-sm
      "
    >
      {showBack && (
        <button
          type="button"
          onClick={() => router.back()}
          className="
            p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800
            active:scale-95 transition flex items-center justify-center
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
      )}
      <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
        {title}
      </h1>
    </header>
  );
}
