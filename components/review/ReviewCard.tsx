'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { UserCircle, ShoppingCart } from 'lucide-react';
import clsx from 'clsx';

import type { Product } from '@/types/product';

/* ===================== TYPES ===================== */

interface ReviewCardProps {
  review: {
    public_id: string;
    user_id: string;
    user_name: string;
    rating: number;
    title?: string;
    comment: string;
    image_urls: string[];
    created_at: string;
    product?: Product;
  };
  isExpanded: boolean;
  toggleExpand: (public_id: string) => void;
  getRelativeTime: (dateString: string) => string;
  renderStars: (rating: number) => React.ReactNode;
  handleOpenAddToCart: (product: Product, buyNow?: boolean) => void;
}

/* ===================== COMPONENT ===================== */

export default function ReviewCard({
  review,
  isExpanded,
  toggleExpand,
  getRelativeTime,
  renderStars,
  handleOpenAddToCart,
}: ReviewCardProps) {
  const router = useRouter();
  const product = review.product;

  const goToReview = () => {
    router.push(`/reviews/${review.public_id}`);
  };

  const truncatedTitle =
    review.title && review.title.length > 25
      ? `${review.title.slice(0, 25)}…`
      : review.title ?? '';

  return (
    <article
      onClick={goToReview}
      className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 transition hover:shadow-lg"
    >
      {/* ================= Reviewer ================= */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <UserCircle className="h-6 w-6" />
          </div>

          <div>
            <p className="font-semibold text-gray-900">{review.user_name}</p>
            <p className="text-xs text-gray-500">
              {getRelativeTime(review.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {renderStars(review.rating)}
        </div>
      </div>

      {/* ================= Title ================= */}
      {truncatedTitle && (
        <h3 className="mb-2 text-sm font-semibold text-gray-800">
          {truncatedTitle}
        </h3>
      )}

      {/* ================= Comment ================= */}
      <div
        className="text-sm leading-relaxed text-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <p className={clsx(!isExpanded && 'line-clamp-3')}>
          {review.comment}
        </p>

        {review.comment.length > 100 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(review.public_id);
            }}
            className="mt-1 text-xs text-blue-600 hover:underline"
          >
            {isExpanded ? 'See Less' : 'See More'}
          </button>
        )}
      </div>

      {/* ================= Images ================= */}
      {review.image_urls.length > 0 && (
        <div className="mt-4">
          <div
            className={clsx(
              review.image_urls.length > 1
                ? 'grid grid-cols-2 gap-3'
                : 'relative'
            )}
          >
            {review.image_urls.map((url) => (
              <div
                key={url}
                className="relative aspect-[4/3] overflow-hidden rounded-xl border shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  goToReview();
                }}
              >
                <Image
                  src={url}
                  alt="Review image"
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= Product Actions ================= */}
      {product && (
        <div
          className="mt-5 flex justify-end gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => handleOpenAddToCart(product, false)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>

          <button
            type="button"
            onClick={() => handleOpenAddToCart(product, true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            🛒 Buy Now
          </button>
        </div>
      )}
    </article>
  );
}
