import { Star, UserStar } from 'lucide-react';
import React from 'react';

type RatingComponentProps = {
  rating: number;
  reviews: number;
};

export default function RatingComponent({ rating, reviews }: RatingComponentProps) {
  return (
    <div className="flex items-center justify-between px-2 pt-2">
      {/* Stars */}
      <div className="flex items-center gap-0.3 relative -left-2">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`h-3 w-3 ${
              index < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
            }`}
          />
        ))}

        {rating > 0 && (
          <span className="text-[0.8rem] md:text-sm font-medium mt-0.5 ml-1 text-amber-500">
            {rating.toFixed(1)}
          </span>
        )}
      </div>

      {/* Reviews */}
      <div className="flex items-center gap-1 text-emerald-500 relative">
        <UserStar className="h-3 w-3" />
        <span className="text-[0.7rem] md:text-sm font-medium">{reviews}</span>
      </div>
    </div>
  );
}
