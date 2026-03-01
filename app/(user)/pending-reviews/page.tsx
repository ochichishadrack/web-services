"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { getApiBaseUrl } from "@/api/api";
import DynamicTopNav from "@/components/ui/DynamicTopNav";
import { useRouter } from "next/navigation";

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

export default function PendingReviewsPage() {
  const { customer, isAuthenticated, loading: authLoading } = useCustomerAuth();
  const customerId = customer?.public_id;
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const callback = encodeURIComponent(window.location.pathname);
      router.push(`/user/login?callbackUrl=${callback}`);
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
        setReviews(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingReviews();
  }, [authLoading, isAuthenticated, customerId, router]);

  if (loading || authLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Loading pending reviews…
        </p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
        <p className="text-lg text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );

  if (reviews.length === 0)
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-4 pb-20 transition-colors">
        <DynamicTopNav title="Pending Reviews" />

        <div className="flex flex-col items-center justify-center text-center mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            No Pending Reviews
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            You&apos;re all caught up! 🎉
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-4 pb-20 transition-colors">
      <DynamicTopNav title="Pending Reviews" />

      <ul className="max-w-3xl mx-auto mt-6 space-y-6">
        {reviews.map((review) => (
          <li
            key={review.order_item_id}
            className="flex items-center gap-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:shadow-md transition"
          >
            {review.productHeroImage && (
              <div className="relative w-24 h-24 rounded-md overflow-hidden shrink-0">
                <Image
                  src={review.productHeroImage}
                  alt={review.productHeroImageName || "Product Image"}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            )}

            <div className="flex flex-col justify-center flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                {review.product}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {review.shortDescription || "No description available."}
              </p>

              {review.isDelivered && (
                <span className="inline-block mt-1 text-xs font-medium text-green-800 bg-green-100 dark:text-green-400 dark:bg-green-900/40 px-2 py-1 rounded-full">
                  Delivered
                </span>
              )}
            </div>

            <div className="shrink-0">
              <Link
                href={`/reviews/submit/${review.product_public_id}`}
                className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-400 transition whitespace-nowrap"
              >
                Review
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
