'use client';

import { Heart, LoaderCircle, ShoppingBag } from 'lucide-react';
import type { MouseEvent } from 'react';

import { useWishlist } from '@/features/wishlist';
import { cn } from '@/lib/utils';
import type { ProductType, ProductVariantType } from '@/types/types';

import { useProductCartQuantity } from './useProductCartQuantity';
import { useProductVariant } from './useProductVariant';

type ProductActionTrayProps = {
  product: ProductType;

  /**
   * Featured surfaces may pass their actively selected variant.
   * Compact cards fall back to the first purchasable variant.
   */
  variant?: ProductVariantType | null;

  onAddToCart?: (product: ProductType, variant: ProductVariantType) => void;

  className?: string;
};

function stopProductActionEvent(event: MouseEvent<HTMLElement>): void {
  event.preventDefault();
  event.stopPropagation();
}

const actionClassName = cn(
  'pointer-events-auto relative grid size-9 shrink-0 place-items-center rounded-full',
  'border border-white/20 bg-background/40 text-foreground shadow-md backdrop-blur-md dark:border-white/10 dark:bg-background/30',
  'transition duration-200',
  'hover:border-white/40 hover:bg-background/80 hover:shadow-lg dark:hover:bg-background/60',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  'disabled:cursor-not-allowed disabled:opacity-40'
);

export function ProductActionTray({ product, variant, onAddToCart, className }: ProductActionTrayProps) {
  const { quantity, cartMutating } = useProductCartQuantity(product.id);
  const { availableVariant } = useProductVariant(product);
  const { toggleWishlist, isWishlisted, isMutating } = useWishlist();

  const activeCommerceVariant = variant ?? availableVariant;
  const unavailable = !activeCommerceVariant || activeCommerceVariant.stockLeft <= 0;
  const saved = isWishlisted(product.id);
  const wishlistMutating = isMutating(product.id);

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>): void => {
    stopProductActionEvent(event);

    if (unavailable || !activeCommerceVariant || cartMutating || !onAddToCart) {
      return;
    }

    onAddToCart(product, activeCommerceVariant);
  };

  const handleWishlist = (event: MouseEvent<HTMLButtonElement>): void => {
    stopProductActionEvent(event);

    if (wishlistMutating) {
      return;
    }

    void toggleWishlist({
      id: product.id,
      name: product.name
    });
  };

  return (
    <div
      className={cn(
        'pointer-events-none absolute bottom-2 left-1/2 z-30 -translate-x-1/2 min-w-[50%] justify-center px-2',
        'flex items-center gap-1.5 rounded-full p-1.5',
        'border border-white/20 bg-background/20 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-background/10',

        /**
         * Touch devices keep actions visible.
         * Hover-capable layouts reveal them only when the card
         * is hovered or receives keyboard focus.
         */
        'opacity-100',
        'sm:translate-y-1 sm:opacity-0',
        'sm:transition sm:duration-200',
        'sm:group-hover:translate-y-0 sm:group-hover:opacity-100',
        'sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100',

        className
      )}>
      <button
        type="button"
        title={unavailable ? 'Product is unavailable' : 'Add to cart'}
        aria-label={unavailable ? `${product.name} is unavailable` : `Add ${product.name} to cart`}
        disabled={unavailable || cartMutating || !onAddToCart}
        className={actionClassName}
        onClick={handleAddToCart}>
        {cartMutating ? <LoaderCircle className="size-4 animate-spin" /> : <ShoppingBag className="size-4" />}

        {quantity > 0 ? (
          <span
            className="
              absolute -right-1 -top-1
              grid min-h-5 min-w-5 place-items-center
              rounded-full bg-foreground px-1
              text-[0.6rem] font-black text-background
              shadow-md
            ">
            {quantity}
          </span>
        ) : null}
      </button>

      <button
        type="button"
        title={saved ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        aria-pressed={saved}
        disabled={wishlistMutating}
        className={cn(
          actionClassName,
          saved && 'border-rose-500/40 text-rose-500 bg-rose-500/10 dark:bg-rose-500/20'
        )}
        onClick={handleWishlist}>
        {wishlistMutating ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Heart className={cn('size-4', saved && 'fill-current')} />
        )}
      </button>
    </div>
  );
}
