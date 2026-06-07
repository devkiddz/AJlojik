import { Star, UserStar } from 'lucide-react';
import React from 'react';

type RatingComponentProps = {
  rating: number;
  reviews: number;
};
export default function RatingComponent({ rating, reviews }: RatingComponentProps) {
  return (
    <>
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className={`h-4 w-4 ${
                index < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
              }`}
            />
          ))}

          <span className="text-sm font-medium ml-1">{rating}</span>
        </div>

        <span className=" flex items-center text-emerald-500 py-1 px-3 justify-center">
          <UserStar className="w-4 h-4" />
          <span className="text-sm">{reviews}</span>
        </span>
      </div>
    </>
  );
}
