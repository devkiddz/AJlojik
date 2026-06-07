'use client';

import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

type LikedComponentProps = {
  productId: string;
  liked: boolean;
};

type LikedProducts = Record<string, boolean>;

const safeParse = (value: string | null): LikedProducts => {
  try {
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
};

export default function LikedComponent({ productId, liked = false }: LikedComponentProps) {
  const [isLiked, setIsLiked] = useState<boolean>(liked);

  // Load liked state from localStorage after hydration
  useEffect(() => {
    const stored = localStorage.getItem('liked_products');
    const parsed = safeParse(stored);

    setIsLiked(parsed[productId] ?? liked);
  }, [productId, liked]);

  // Persist changes to localStorage
  useEffect(() => {
    const stored = localStorage.getItem('liked_products');
    const parsed = safeParse(stored);

    parsed[productId] = isLiked;

    localStorage.setItem('liked_products', JSON.stringify(parsed));
  }, [isLiked, productId]);

  const handleLike = () => {
    setIsLiked((prev: boolean) => !prev);
  };

  return (
    <div className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full bg-muted shadow-lg">
      <button type="button" onClick={handleLike} aria-label={isLiked ? 'Unlike product' : 'Like product'}>
        <Heart
          className={`h-4 w-4 transition-all cursor-pointer duration-200 ${
            isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
          }`}
        />
      </button>
    </div>
  );
}
