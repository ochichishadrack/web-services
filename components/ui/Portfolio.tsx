'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import portfolioItems from '@/data/portfolioData';

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(portfolioItems.map((item) => item.category)))];

  // Filtered items
  const filteredItems =
    selectedCategory === 'All'
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === selectedCategory);

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Our Portfolio</h2>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition 
                ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-600 hover:text-white'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Link
              key={item.id}
              href={item.link}
              className="group block relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition"
            >
              <div className="relative w-full aspect-square overflow-hidden">
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.category}
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-gray-900">
                <h3 className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200">
                  {item.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}

          {filteredItems.length === 0 && (
            <p className="col-span-full text-center text-gray-500 dark:text-gray-400 mt-6">
              No portfolio items found in this category.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
