// components/ui/skeleton-loads/ReviewSkeleton.tsx
"use client";
import React from "react";

const ReviewSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-5 border rounded-xl bg-gray-50 shadow-sm animate-pulse space-y-3"
        >
          <div className="flex justify-between items-center">
            <div className="h-4 w-24 bg-gray-300 rounded"></div>
            <div className="h-3 w-16 bg-gray-300 rounded"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-24 bg-gray-300 rounded"></div>
          </div>
          <div className="h-3 w-full bg-gray-300 rounded"></div>
          <div className="h-3 w-5/6 bg-gray-300 rounded"></div>
          <div className="flex gap-3 mt-2">
            {[1, 2, 3].map((j) => (
              <div
                key={j}
                className="w-20 h-20 bg-gray-300 rounded-lg"
              ></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewSkeleton;
