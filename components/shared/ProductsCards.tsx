'use client';

import { ProductType } from '@/types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import RatingComponent from './RatingComponent';
import { ChartColumnStacked, Eye } from 'lucide-react';
import LikedComponent from './LikedComponent';

type ProductCardProps = {
  product: ProductType;
  onSelect?: () => void;
  onToggleLike?: () => void;
};

export default function ProductCard({ product, onSelect, onToggleLike }: ProductCardProps) {
  const router = useRouter();
  const defaultVariant = product.variants?.[1];

  const handleCardClick = () => {
    router.push(`/products/${product.id}`);
  };

  return (
    <div
      onClick={onSelect}
      className="group cursor-pointer rounded-xl border bg-background p-2 transition hover:shadow-md">
      {/* IMAGE CONTAINER */}
      <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
        {defaultVariant?.image && (
          <Image
            src={defaultVariant.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform"
          />
        )}

        {/* LIKE BUTTON - Forced size, padding, and high z-index */}
        <div
          className="absolute top right-3 z-30 min-w-[32px] min-h-[32px] flex items-center justify-center"
          onClick={e => e.stopPropagation()}>
          <LikedComponent productId={product.id} liked={product.liked} onToggle={onToggleLike} />
        </div>
      </div>

      {/* INFO */}
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-2">{product.shortDescription}</p>

        <div className="flex justify-between items-center p-2">
          <span className="text-xs text-primary flex items-center gap-1 mt-1">
            <ChartColumnStacked className="w-3 h-3 text-rose-500" />
            {product.category}
          </span>

          <span
            onClick={e => {
              e.stopPropagation();
              if (handleCardClick) handleCardClick();
            }}
            className="text-xs px-3 py-1 rounded-full border flex gap-2 items-center justify-around hover:bg-muted transition-colors">
            Preview
            <Eye className="w-3 h-3" />
          </span>
        </div>

        {/* <div className="mt-2">
          <RatingComponent rating={product.rating} reviews={product.reviews} />
        </div> */}

        <div className="flex items-center justify-between mt-3">
          {/* <div className="font-bold text-rose-500 text-sm">₦{product.price}</div> */}

          {/* PREVIEW BUTTON */}
        </div>
      </div>
    </div>
  );
}
