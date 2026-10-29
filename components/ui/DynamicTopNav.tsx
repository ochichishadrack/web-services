'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import CountrySelector from '@/components/ui/CountrySelector';

interface DynamicTopNavProps {
  title: string;
  showBack?: boolean; // optional, defaults to true
}

export default function DynamicTopNav({ title, showBack = true }: DynamicTopNavProps) {
  const router = useRouter();

  return (
    <header
      className="
        sticky top-0 z-50
        bg-white/90 dark:bg-[#1f2228]/90 backdrop-blur
        border-b border-gray-100 dark:border-white/10
        pt-[env(safe-area-inset-top)]
      "
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 md:px-6">
        {showBack && (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="
              -ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full
              text-gray-700 dark:text-gray-200
              hover:bg-gray-100 dark:hover:bg-white/10
              active:scale-95 transition
              focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40
            "
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </h1>

        <div className="shrink-0">
          <CountrySelector />
        </div>
      </div>
    </header>
  );
}
