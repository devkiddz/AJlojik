'use client';

import { Eye, Heart, LoaderCircle, ShoppingBag } from 'lucide-react';

import type { MouseEvent, PointerEvent } from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useWishlist } from '@/features/wishlist';

import { cn } from '@/lib/utils';

import type { ProductType, ProductVariantType } from '@/types/types';

import styles from './premiumCard.module.css';

import { useProductCartQuantity } from './useProductCartQuantity';

type ProductActionTrayProps = {
  product: ProductType;

  selectedVariant: ProductVariantType;

  selectedVariantId: string;

  onSelectedVariantIdChange: (variantId: string) => void;

  onPreview?: (product: ProductType) => void;

  onAddToCart?: (product: ProductType, variant: ProductVariantType) => void;

  className?: string;
};

function stopPointerEvent(event: MouseEvent<HTMLElement> | PointerEvent<HTMLElement>) {
  event.preventDefault();
  event.stopPropagation();
}

const actionClassName = cn(
  'relative flex h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl',
  'border border-white/10 bg-background/80 px-2 text-foreground shadow-sm backdrop-blur-xl',
  'transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
);

export function ProductActionTray({
  product,
  selectedVariant,
  selectedVariantId,
  onSelectedVariantIdChange,
  onPreview,
  onAddToCart,
  className
}: ProductActionTrayProps) {
  const { quantity, cartMutating } = useProductCartQuantity(product.id);

  const { toggleWishlist, isWishlisted, isMutating } = useWishlist();

  const saved = isWishlisted(product.id);

  const wishlistMutating = isMutating(product.id);

  const outOfStock = selectedVariant.stockLeft <= 0;

  const handleWishlist = (event: MouseEvent<HTMLButtonElement>) => {
    stopPointerEvent(event);

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
        styles.actionTray,
        'absolute inset-x-2 bottom-2 z-40 rounded-2xl border border-white/10 bg-black/35 p-2 shadow-2xl backdrop-blur-2xl',
        className
      )}
      onClick={event => event.stopPropagation()}
      onPointerDown={event => event.stopPropagation()}>
      {product.variants.length > 1 && (
        <div className="mb-2">
          <Select value={selectedVariantId} onValueChange={onSelectedVariantIdChange}>
            <SelectTrigger className="h-8 rounded-lg border-white/10 bg-background/80 text-xs shadow-none backdrop-blur-xl">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>

            <SelectContent>
              {product.variants.map(variant => (
                <SelectItem key={variant.id} value={String(variant.id)}>
                  {variant.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex gap-1.5">
        <button
          type="button"
          title="Quick preview"
          aria-label={`Quick preview ${product.name}`}
          className={actionClassName}
          onClick={event => {
            stopPointerEvent(event);
            onPreview?.(product);
          }}>
          <Eye className="size-4" />

          <span className="text-[0.6rem] font-semibold">Preview</span>
        </button>

        <button
          type="button"
          title="Add to cart"
          aria-label={`Add ${product.name} to cart`}
          disabled={outOfStock || cartMutating || !onAddToCart}
          className={cn(actionClassName, 'disabled:cursor-not-allowed disabled:opacity-50')}
          onClick={event => {
            stopPointerEvent(event);

            onAddToCart?.(product, selectedVariant);
          }}>
          {cartMutating ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <ShoppingBag className="size-4" />
          )}

          <span className="text-[0.6rem] font-semibold">{outOfStock ? 'Sold out' : 'Cart'}</span>

          {quantity > 0 && (
            <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[0.6rem] font-black text-primary-foreground shadow-md">
              +{quantity}
            </span>
          )}
        </button>

        <button
          type="button"
          title={saved ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={saved}
          disabled={wishlistMutating}
          className={cn(
            actionClassName,
            saved && 'border-primary/30 text-primary',

            wishlistMutating && 'cursor-wait opacity-60'
          )}
          onClick={handleWishlist}>
          {wishlistMutating ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Heart className={cn('size-4', saved && 'fill-current')} />
          )}

          <span className="text-[0.6rem] font-semibold">Wishlist</span>
        </button>
      </div>
    </div>
  );
}
