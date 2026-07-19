'use client';

import { Eye, Heart, LoaderCircle, ShoppingBag } from 'lucide-react';

import type { MouseEvent, PointerEvent } from 'react';

import { useWishlist } from '@/features/wishlist';

import { cn } from '@/lib/utils';

import type { ProductType, ProductVariantType } from '@/types/types';

import { useProductCartQuantity } from './useProductCartQuantity';

type ProductActionTrayProps = {
  product: ProductType;

  onPreview?: (product: ProductType) => void;

  onAddToCart?: (product: ProductType, variant: ProductVariantType) => void;

  className?: string;
};

function stopProductActionEvent(event: MouseEvent<HTMLElement> | PointerEvent<HTMLElement>) {
  event.preventDefault();
  event.stopPropagation();
}

const actionClassName = cn(
  'pointer-events-auto relative grid size-9 shrink-0 place-items-center rounded-full',
  'border border-white/15 bg-black/55 text-white shadow-lg backdrop-blur-md',
  'transition duration-200',
  'hover:scale-105 hover:border-white/30 hover:bg-black/80',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
  'disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:scale-100'
);

export function ProductActionTray({ product, onPreview, onAddToCart, className }: ProductActionTrayProps) {
  const { quantity, cartMutating } = useProductCartQuantity(product.id);

  const { toggleWishlist, isWishlisted, isMutating } = useWishlist();

  /**
   * Compact cards do not expose variant selection.
   *
   * Cart uses the first purchasable variant.
   * Quick Preview remains the place for deliberate
   * variant inspection and selection.
   */
  const availableVariant = product.variants.find(variant => variant.stockLeft > 0) ?? null;

  const soldOut = availableVariant === null;

  const saved = isWishlisted(product.id);

  const wishlistMutating = isMutating(product.id);

  const handlePreview = (event: MouseEvent<HTMLButtonElement>) => {
    stopProductActionEvent(event);

    onPreview?.(product);
  };

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    stopProductActionEvent(event);

    if (!availableVariant || cartMutating || !onAddToCart) {
      return;
    }

    onAddToCart(product, availableVariant);
  };

  const handleWishlist = (event: MouseEvent<HTMLButtonElement>) => {
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
        'pointer-events-none absolute inset-x-0 bottom-0 z-30',

        'flex items-end justify-end gap-2',

        /**
         * The gradient grounds the actions without creating
         * a visible shared action block.
         */
        'bg-gradient-to-t from-black/70 via-black/20 to-transparent',

        'p-3 pt-12',

        /**
         * Touch devices keep the icons available.
         *
         * Hover-capable layouts reveal them only when the card
         * is hovered or receives keyboard focus.
         */
        'translate-y-0 opacity-100',

        'md:translate-y-2 md:opacity-0',

        'md:transition md:duration-200',

        'md:group-hover:translate-y-0',
        'md:group-hover:opacity-100',

        'md:group-focus-within:translate-y-0',
        'md:group-focus-within:opacity-100',

        className
      )}>
      <button
        type="button"
        title="Quick preview"
        aria-label={`Quick preview ${product.name}`}
        className={actionClassName}
        onPointerDown={stopProductActionEvent}
        onClick={handlePreview}>
        <Eye className="size-4" />
      </button>

      <button
        type="button"
        title={soldOut ? 'Product is sold out' : 'Add to cart'}
        aria-label={soldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`}
        disabled={soldOut || cartMutating || !onAddToCart}
        className={actionClassName}
        onPointerDown={stopProductActionEvent}
        onClick={handleAddToCart}>
        {cartMutating ? <LoaderCircle className="size-4 animate-spin" /> : <ShoppingBag className="size-4" />}

        {quantity > 0 ? (
          <span
            className={cn(
              'absolute -right-1.5 -top-1.5',
              'grid min-h-5 min-w-5 place-items-center',
              'rounded-full bg-primary px-1',
              'text-[0.6rem] font-black text-primary-foreground',
              'shadow-md'
            )}>
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

          saved && 'border-primary/40 text-primary',

          wishlistMutating && 'cursor-wait opacity-60'
        )}
        onPointerDown={stopProductActionEvent}
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
