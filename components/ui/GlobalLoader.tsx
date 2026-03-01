"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function GlobalLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const handleStart = () => {
      // Add delay to avoid flashing the loader too quickly
      timer = setTimeout(() => setLoading(true), 100);
    };

    const handleStop = () => {
      clearTimeout(timer);
      setLoading(false);
    };

    // Start and stop loader on route change
    handleStop(); // hide loader initially
    handleStart();

    return () => {
      clearTimeout(timer);
    };
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out">
      <div className="flex flex-col items-center space-y-4">
        {/* Modern Spinner SVG */}
        <svg
          className="animate-spin h-16 w-16 text-indigo-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>

        {/* Optional loading text */}
        <p className="text-white text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}
