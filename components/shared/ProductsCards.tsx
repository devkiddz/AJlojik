'use client';

import { ProductType } from '@/types';
import Image from 'next/image';
import RatingComponent from './RatingComponent';
import { ChartColumnStacked } from 'lucide-react';
import LikedComponent from './LikedComponent';

type ProductCardProps = {
  product: ProductType;
  onSelect?: () => void;
  onToggleLike?: () => void;
};

export default function ProductCard({ product, onSelect, onToggleLike }: ProductCardProps) {
  return (
    <div
      onClick={onSelect}
      className="group cursor-pointer rounded-xl border bg-background p-2 transition hover:shadow-md">
      {/* IMAGE */}
      <div className="relative aspect-4/3 bg-muted rounded-lg overflow-hidden">
        <Image
          src={product.images}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-[1.02] transition-transform"
        />

        <LikedComponent productId={product.id} liked={product.liked} onToggle={onToggleLike} />
      </div>

      {/* INFO */}
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>

        <span className="text-xs text-primary flex items-center gap-1 mt-1">
          <ChartColumnStacked className="w-3 h-3 text-rose-500" />
          {product.category}
        </span>

        <p className="text-xs text-muted-foreground line-clamp-2 mt-2">{product.shortDescription}</p>

        <div className="mt-2">
          <RatingComponent rating={product.rating} reviews={product.reviews} />
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="font-bold text-rose-500 text-sm">₦{product.price}</div>

          <span className="text-xs px-3 py-1 rounded-full border">View</span>
        </div>
      </div>
    </div>
  );
}
