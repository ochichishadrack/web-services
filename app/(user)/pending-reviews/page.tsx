"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { getApiBaseUrl } from "@/api/api";
import DynamicTopNav from "@/components/ui/DynamicTopNav";
import { useRouter, usePathname } from "next/navigation";
import { Star, Package } from "lucide-react";

interface Review {
  order_item_id: number;
  product_public_id: string;
  product: string;
  productHeroImage?: string;
  productHeroImageName?: string;
  shortDescription?: string;
  variant?: {
    color?: string;
    size?: string;
    dimension?: string;
    weight?: string;
  };
  quantity: number;
  price: number;
  status: string;
  isDelivered: boolean;
}

function SkeletonCard() {
  return (
    <div className="flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-5 animate-pulse">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-200 dark:bg-gray-800 shrink-0" />
      <div className="flex-1 space-y-2.5 min-w-0">
        <div className="h-5 w-2/3 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>
      <div className="h-10 w-20 rounded-xl bg-gray-200 dark:bg-gray-800 shrink-0" />
    </div>
  );
}

export default function PendingReviewsPage() {
  const { customer, isAuthenticated, loading: authLoading } = useCustomerAuth();
  const customerId = customer?.public_id;
  const router = useRouter();
  const pathname = usePathname();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const callbackUrl = encodeURIComponent(pathname || "/pending-reviews");
      router.replace(`/login?callbackUrl=${callbackUrl}`);
      return;
    }

    if (!customerId) return;

    const fetchPendingReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${getApiBaseUrl()}/api/orders/pending-reviews/${customerId}`,
        );

        if (!res.ok) throw new Error("Failed to fetch reviews");

        const data: Review[] = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingReviews();
  }, [authLoading, isAuthenticated, customerId, router, pathname]);

  /* Loading */
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <DynamicTopNav title="Pending Reviews" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-4">
          <div className="h-20 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  /* Error */
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <DynamicTopNav title="Pending Reviews" />
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4">
          <p className="text-red-600 dark:text-red-400 font-medium text-center">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:opacity-90 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* Empty */
  if (reviews.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <DynamicTopNav title="Pending Reviews" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center mb-5">
            <Star className="w-8 h-8 text-orange-500 dark:text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            No Pending Reviews
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
            You&apos;re all caught up! Reviews for delivered items will show up
            here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DynamicTopNav title="Pending Reviews" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Pending Reviews
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Share your experience on {reviews.length} delivered{" "}
                {reviews.length === 1 ? "item" : "items"}.
              </p>
            </div>
          </div>
        </div>

        {/* List */}
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li
              key={review.order_item_id}
              className="
                flex items-center gap-4
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-2xl p-4 sm:p-5
                shadow-sm hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800/40
                transition
              "
            >
              {/* Image */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
                {review.productHeroImage ? (
                  <Image
                    src={review.productHeroImage}
                    alt={review.productHeroImageName || review.product}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col justify-center flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                  {review.product}
                </h3>

                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                  {review.shortDescription || "No description available."}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {review.isDelivered && (
                    <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                      Delivered
                    </span>
                  )}
                  {review.quantity > 1 && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Qty: {review.quantity}
                    </span>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="shrink-0">
                <Link
                  href={`/reviews/submit/${review.product_public_id}`}
                  className="
                    inline-flex items-center justify-center
                    bg-orange-500 hover:bg-orange-600
                    text-white px-4 py-2.5 rounded-xl
                    text-sm font-semibold
                    shadow-sm shadow-orange-500/20
                    transition whitespace-nowrap
                  "
                >
                  Review
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
