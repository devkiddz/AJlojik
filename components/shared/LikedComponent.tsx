'use client';

import { Heart } from 'lucide-react';

type LikedComponentProps = {
  productId: string;
  liked: boolean;
  onToggle?: () => void;
};

export default function LikedComponent({ liked, onToggle }: LikedComponentProps) {
  return (
    <button
      aria-label="liked"
      type="button"
      onClick={e => {
        e.stopPropagation();
        onToggle?.();
      }}
      className="absolute left-1 top-3 z-10 cursor-pointer">
      <Heart className={liked ? 'w-5 h-5 fill-red-500 text-red-500' : 'text-white w-5 h-5'} />
    </button>
  );
}
