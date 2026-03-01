'use client';

import React from 'react';
import clsx from 'clsx';
import { XMarkIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

export interface ProductInReview {
  public_id: string;
  name: string;
  short_description?: string;
  price?: number;
  image_url?: string;
}

interface ReviewFilterSidebarProps {
  products: ProductInReview[];
  selectedProductId: string | null;
  onChange: (productId: string | null) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ReviewFilterSidebar({
  products,
  selectedProductId,
  onChange,
  isOpen = true,
  onClose,
}: ReviewFilterSidebarProps) {
  const handleSelect = (productId: string | null) => {
    onChange(productId);
    if (onClose) onClose(); // Close sidebar on mobile
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          'fixed top-0 left-0 bottom-0 w-80 bg-white shadow-2xl p-6 space-y-6 z-50 transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'md:relative md:translate-x-0 md:shadow-none'
        )}
      >
        {/* Mobile Header */}
        <div className="flex justify-between items-center mb-6 md:hidden">
          <h2 className="text-2xl font-bold text-gray-800">Filters</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition"
              aria-label="Close Filters"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Sidebar Description */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 mt-1">
            Filter reviews by product. Select a product to view its reviews or &quot;All Products&quot; to see
            all reviews.
          </p>
        </div>

        {/* Filter List */}
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[65vh]">
          {/* All Products Button */}
          <button
            className={clsx(
              'px-4 py-2 rounded-xl font-semibold text-sm flex items-center justify-center transition shadow-sm hover:shadow-md',
              !selectedProductId
                ? 'bg-blue-600 text-white border border-blue-600'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            )}
            onClick={() => handleSelect(null)}
          >
            All Products
          </button>

          {/* Product Buttons */}
          {products.map((product) => (
            <button
              key={product.public_id}
              className={clsx(
                'flex items-center gap-4 p-3 rounded-xl border hover:shadow-lg transition bg-white text-gray-700 text-left',
                selectedProductId === product.public_id
                  ? 'bg-blue-50 border-blue-400 shadow'
                  : 'border-gray-200'
              )}
              onClick={() => handleSelect(product.public_id)}
            >
              {/* Product Image */}
              {product.image_url ? (
                <div className="w-14 h-14 relative flex-shrink-0">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 bg-gray-200 rounded-lg flex-shrink-0" />
              )}

              {/* Product Info */}
              <div className="flex flex-col flex-1 min-w-0">
                <span
                  className={clsx(
                    'font-semibold text-sm truncate',
                    selectedProductId === product.public_id ? 'text-blue-600' : 'text-gray-800'
                  )}
                >
                  {product.name}
                </span>

                {product.short_description && (
                  <span className="text-xs text-gray-500 truncate mt-1">
                    {product.short_description}
                  </span>
                )}

                {product.price !== undefined && (
                  <span className="text-sm font-semibold text-gray-900 mt-1 truncate">
                    Ksh {product.price.toFixed(2)}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}
