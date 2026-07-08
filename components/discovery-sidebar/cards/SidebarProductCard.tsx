import Image from 'next/image';
import { Heart, Star } from 'lucide-react';

import { ProductType } from '@/types';

type Props = {
  product: ProductType;
  index?: number;
  showRank?: boolean;
  onSelect?: (product: ProductType) => void;
};

export default function SidebarProductCard({ product, index, showRank = false, onSelect }: Props) {
  const variant = product.variants[0];

  return (
    <button
      type="button"
      onClick={() => onSelect?.(product)}
      className="group flex w-full items-center gap-3 rounded-2xl p-2 text-left transition hover:bg-background/70">
      {showRank ? (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-xs font-black text-secondary">
          {index}
        </span>
      ) : null}

      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
        <Image
          src={variant.image}
          alt={product.name}
          fill
          sizes="56px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-xs font-bold">{product.name}</p>

        <p className="mt-0.5 text-xs font-black text-secondary">₦{variant.price.toLocaleString()}</p>

        <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {product.rating}
          </span>

          {product.liked ? (
            <span className="flex items-center gap-1 text-secondary">
              <Heart className="h-3 w-3 fill-current" />
              Saved
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
