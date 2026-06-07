import { Star, UserStar } from 'lucide-react';
import React from 'react';

type RatingComponentProps = {
  rating: number;
  reviews: number;
};

export default function RatingComponent({ rating, reviews }: RatingComponentProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      {/* Stars */}
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${
              index < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
            }`}
          />
        ))}

        <span className="text-sm font-medium ml-1 text-amber-500">{rating.toFixed(1)}</span>
      </div>

      {/* Reviews */}
      <div className="flex items-center gap-1 text-emerald-500">
        <UserStar className="w-4 h-4" />
        <span className="text-sm">{reviews}</span>
      </div>
    </div>
  );
}
