'use client';

import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  setRating: (value: number) => void;
  size?: number;
}

export default function RatingStars({ rating, setRating, size = 28 }: RatingStarsProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`cursor-pointer ${rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
          onClick={() => setRating(star)}
          fill={rating >= star ? '#facc15' : 'none'}
        />
      ))}
    </div>
  );
}
