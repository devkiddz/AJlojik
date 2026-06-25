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
        console.log('liked:', liked);
      }}
      className="absolute left-1 top-3 z-10 cursor-pointer">
      <Heart className={liked ? 'w-5 h-5 fill-secondary text-secondary' : 'text-primary w-5 h-5'} />
    </button>
  );
}
