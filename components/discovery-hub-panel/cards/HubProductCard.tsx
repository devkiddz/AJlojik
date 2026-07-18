'use client';

import Image from 'next/image';

import { Check, Heart, LoaderCircle, ShoppingCart, Star } from 'lucide-react';

import { useState } from 'react';

import { useCart } from '@/features/cart';
import { cn } from '@/lib/utils';

import type { ProductType } from '@/types/types';

type HubProductCardProps = {
  product: ProductType;
  index?: number;
  showRank?: boolean;

  onSelect?: (product: ProductType) => void;

  onToggleLike?: (productId: string) => void;
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(price);
}

export default function HubProductCard({
  product,
  index,
  showRank = false,
  onSelect,
  onToggleLike
}: HubProductCardProps) {
  const { items, addToCart, mutating } = useCart();

  const [addingToCart, setAddingToCart] = useState(false);

  const variant = product.variants[0];

  const cartItem = variant ? items.find(item => item.variantId === variant.id) : undefined;

  const unavailable = !variant || variant.stockLeft <= 0;

  const handleAddToCart = async (): Promise<void> => {
    if (!variant || unavailable || mutating || addingToCart) {
      return;
    }

    setAddingToCart(true);

    try {
      await addToCart({
        product,
        variant,
        quantity: 1
      });
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <article className="group flex w-full items-center gap-2 rounded-2xl p-2 transition hover:bg-background/70">
      {showRank ? (
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary/10 text-xs font-black text-secondary">
          {index}
        </span>
      ) : null}

      <button
        type="button"
        onClick={() => onSelect?.(product)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
          <Image
            src={variant?.image ?? '/placeholder.svg'}
            alt={product.name}
            fill
            sizes="56px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-xs font-bold text-primary">{product.name}</p>

          {variant ? (
            <p className="mt-0.5 truncate text-xs font-black text-secondary">{formatPrice(variant.price)}</p>
          ) : (
            <p className="mt-0.5 text-xs font-semibold text-destructive">Unavailable</p>
          )}

          <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="size-3" />

              {product.rating}
            </span>

            {product.liked ? (
              <span className="flex items-center gap-1 text-secondary">
                <Heart className="size-3 fill-current" />
                Saved
              </span>
            ) : null}
          </div>
        </div>
      </button>

      <div className="flex shrink-0 flex-col gap-1.5">
        <button
          type="button"
          aria-label={product.liked ? `Remove ${product.name} from saved products` : `Save ${product.name}`}
          disabled={!onToggleLike}
          onClick={() => onToggleLike?.(product.id)}
          className={cn(
            'grid size-8 place-items-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-40',

            product.liked
              ? 'border-secondary/20 bg-secondary/10 text-secondary'
              : 'border-primary/10 bg-background/40 text-primary/50 hover:text-secondary'
          )}>
          <Heart
            className={cn(
              'size-3.5',

              product.liked && 'fill-current'
            )}
          />
        </button>

        <button
          type="button"
          aria-label={cartItem ? `Add another ${product.name}` : `Add ${product.name} to cart`}
          disabled={unavailable || mutating || addingToCart}
          onClick={() => {
            void handleAddToCart();
          }}
          className={cn(
            'relative grid size-8 place-items-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-40',

            cartItem
              ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
              : 'border-primary/10 bg-background/40 text-primary hover:bg-primary hover:text-background'
          )}>
          {addingToCart ? (
            <LoaderCircle className="size-3.5 animate-spin" />
          ) : cartItem ? (
            <Check className="size-3.5" />
          ) : (
            <ShoppingCart className="size-3.5" />
          )}

          {cartItem ? (
            <span className="absolute -right-1.5 -top-1.5 grid min-w-4 place-items-center rounded-full bg-emerald-400 px-1 text-[9px] font-bold leading-4 text-emerald-950">
              {cartItem.quantity > 99 ? '99+' : cartItem.quantity}
            </span>
          ) : null}
        </button>
      </div>
    </article>
  );
}
