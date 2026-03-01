'use client';

import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface StarsProps {
  rating: number;
  size?: number;
  animated?: boolean;
}

export default function Stars({ rating, size = 18, animated = false }: StarsProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const isFilled = i < rating;

        const star = (
          <Star
            key={i}
            size={size}
            strokeWidth={2}
            className={`transition-colors duration-300 ${
              isFilled ? 'text-yellow-400 fill-yellow-400 drop-shadow-sm' : 'text-gray-300'
            }`}
          />
        );

        if (!animated) return star;

        return (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
          >
            {star}
          </motion.div>
        );
      })}
    </div>
  );
}
