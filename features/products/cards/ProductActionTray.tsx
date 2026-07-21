'use client';

import {
  Heart,
  LoaderCircle,
  Minus,
  Plus,
  ShoppingBag
} from 'lucide-react';

import type {
  MouseEvent
} from 'react';

import {
  useWishlist
} from '@/features/wishlist';

import { cn } from '@/lib/utils';

import type {
  ProductType,
  ProductVariantType
} from '@/types/types';

import type {
  ProductCardActions
} from './productCardTypes';

import {
  useProductCartQuantity
} from './useProductCartQuantity';

import {
  useProductVariant
} from './useProductVariant';

type ProductActionTrayPresentation =
  | 'overlay'
  | 'inline';

type ProductActionTrayProps = {
  product: ProductType;

  /**
   * Featured surfaces pass their actively selected variant.
   * Compact cards fall back to the first purchasable variant.
   */
  variant?: ProductVariantType | null;

  onAddToCart?:
    ProductCardActions['onAddToCart'];

  presentation?:
    ProductActionTrayPresentation;

  compact?: boolean;
  showAddLabel?: boolean;
  showWishlist?: boolean;

  className?: string;
};

function stopProductActionEvent(
  event: MouseEvent<HTMLElement>
): void {
  event.preventDefault();
  event.stopPropagation();
}

export function ProductActionTray({
  product,
  variant,
  onAddToCart,
  presentation = 'overlay',
  compact = false,
  showAddLabel = presentation === 'inline',
  showWishlist = true,
  className
}: ProductActionTrayProps) {
  const {
    availableVariant
  } = useProductVariant(product);

  const {
    toggleWishlist,
    isWishlisted,
    isMutating
  } = useWishlist();

  const activeCommerceVariant =
    variant ??
    availableVariant;

  const {
    variantQuantity,
    cartMutating,
    pendingAction,
    canIncrement,
    canDecrement,
    addOne,
    removeOne
  } = useProductCartQuantity(
    product,
    activeCommerceVariant,
    {
      onAddToCart
    }
  );

  const unavailable =
    !activeCommerceVariant ||
    activeCommerceVariant.stockLeft <= 0;

  const reachedStockLimit =
    Boolean(
      activeCommerceVariant &&
      variantQuantity >=
        activeCommerceVariant.stockLeft
    );

  const saved =
    isWishlisted(product.id);

  const wishlistMutating =
    isMutating(product.id);

  const cartBusy =
    cartMutating ||
    pendingAction !== null;

  const overlay =
    presentation === 'overlay';

  const buttonSizeClassName =
    compact
      ? 'size-8'
      : 'size-9';

  const iconSizeClassName =
    compact
      ? 'size-3.5'
      : 'size-4';

  const actionClassName =
    cn(
      'pointer-events-auto relative grid shrink-0 place-items-center rounded-full',
      buttonSizeClassName,
      'transition duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      'disabled:cursor-not-allowed disabled:opacity-40',

      overlay
        ? 'border border-white/20 bg-background/45 text-foreground shadow-md backdrop-blur-md hover:border-white/40 hover:bg-background/85 dark:border-white/10 dark:bg-background/30 dark:hover:bg-background/60'
        : 'border border-border bg-background text-foreground shadow-sm hover:bg-muted'
    );

  const handleAdd =
    (
      event: MouseEvent<HTMLButtonElement>
    ): void => {
      stopProductActionEvent(event);

      if (
        unavailable ||
        cartBusy ||
        !canIncrement
      ) {
        return;
      }

      void addOne();
    };

  const handleRemove =
    (
      event: MouseEvent<HTMLButtonElement>
    ): void => {
      stopProductActionEvent(event);

      if (
        cartBusy ||
        !canDecrement
      ) {
        return;
      }

      void removeOne();
    };

  const handleWishlist =
    (
      event: MouseEvent<HTMLButtonElement>
    ): void => {
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
        'pointer-events-auto hidden items-center gap-1.5 rounded-full p-1.5 lg:flex',

        overlay
          ? [
              'absolute bottom-2 left-1/2 z-30 -translate-x-1/2',
              'border border-white/20 bg-background/20 shadow-xl backdrop-blur-xl',
              'dark:border-white/10 dark:bg-background/10',
              'opacity-100 sm:translate-y-1 sm:opacity-0',
              'sm:transition sm:duration-200',
              'sm:group-hover:translate-y-0 sm:group-hover:opacity-100',
              'sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100'
            ]
          : 'relative border border-border/70 bg-background/80 shadow-sm backdrop-blur-md',

        className
      )}
    >
      {variantQuantity > 0 ? (
        <div
          className={cn(
            'flex items-center rounded-full border',

            overlay
              ? 'border-white/15 bg-background/35'
              : 'border-border bg-muted/40'
          )}
        >
          <button
            type="button"
            title={
              variantQuantity <= 1
                ? 'Remove from cart'
                : 'Decrease quantity'
            }
            aria-label={
              variantQuantity <= 1
                ? `Remove ${product.name} from cart`
                : `Decrease ${product.name} quantity`
            }
            disabled={
              cartBusy ||
              !canDecrement
            }
            className={cn(
              actionClassName,
              'border-0 bg-transparent shadow-none hover:bg-background/70'
            )}
            onClick={handleRemove}
          >
            {pendingAction === 'decrement' ||
            pendingAction === 'remove' ? (
              <LoaderCircle
                className={cn(
                  iconSizeClassName,
                  'animate-spin'
                )}
              />
            ) : (
              <Minus
                className={
                  iconSizeClassName
                }
              />
            )}
          </button>

          <span
            aria-live="polite"
            className={cn(
              'min-w-6 px-1 text-center font-black tabular-nums',
              compact
                ? 'text-[0.65rem]'
                : 'text-xs'
            )}
          >
            {variantQuantity > 99
              ? '99+'
              : variantQuantity}
          </span>

          <button
            type="button"
            title={
              reachedStockLimit
                ? 'Available stock reached'
                : 'Increase quantity'
            }
            aria-label={`Increase ${product.name} quantity`}
            disabled={
              unavailable ||
              cartBusy ||
              !canIncrement
            }
            className={cn(
              actionClassName,
              'border-0 bg-transparent shadow-none hover:bg-background/70'
            )}
            onClick={handleAdd}
          >
            {pendingAction === 'increment' ? (
              <LoaderCircle
                className={cn(
                  iconSizeClassName,
                  'animate-spin'
                )}
              />
            ) : (
              <Plus
                className={
                  iconSizeClassName
                }
              />
            )}
          </button>
        </div>
      ) : (
        <button
          type="button"
          title={
            unavailable
              ? 'Product is unavailable'
              : 'Add to cart'
          }
          aria-label={
            unavailable
              ? `${product.name} is unavailable`
              : `Add ${product.name} to cart`
          }
          disabled={
            unavailable ||
            cartBusy ||
            !canIncrement
          }
          className={cn(
            actionClassName,
            showAddLabel &&
              'flex w-auto gap-1.5 px-3'
          )}
          onClick={handleAdd}
        >
          {pendingAction === 'increment' ? (
            <LoaderCircle
              className={cn(
                iconSizeClassName,
                'animate-spin'
              )}
            />
          ) : (
            <ShoppingBag
              className={
                iconSizeClassName
              }
            />
          )}

          {showAddLabel ? (
            <span
              className={cn(
                'whitespace-nowrap font-semibold',
                compact
                  ? 'text-[0.65rem]'
                  : 'text-xs'
              )}
            >
              {unavailable
                ? 'Unavailable'
                : 'Add'}
            </span>
          ) : null}
        </button>
      )}

      {showWishlist ? (
        <button
          type="button"
          title={
            saved
              ? 'Remove from wishlist'
              : 'Add to wishlist'
          }
          aria-label={
            saved
              ? `Remove ${product.name} from wishlist`
              : `Save ${product.name} to wishlist`
          }
          aria-pressed={saved}
          disabled={wishlistMutating}
          className={cn(
            actionClassName,
            'transition-colors duration-200',
            saved
              ? 'border-rose-500/50 bg-rose-500/15 text-rose-500 hover:bg-rose-500/20 dark:bg-rose-500/20 dark:hover:bg-rose-500/25'
              : 'text-foreground'
          )}
          onClick={handleWishlist}
        >
          {wishlistMutating ? (
            <LoaderCircle
              className={cn(
                iconSizeClassName,
                'animate-spin'
              )}
            />
          ) : (
            <Heart
              className={cn(
                iconSizeClassName,
                'transition-[color,fill,transform] duration-200',
                saved
                  ? 'scale-110 fill-rose-500 text-rose-500'
                  : 'fill-transparent text-current'
              )}
            />
          )}
        </button>
      ) : null}
    </div>
  );
}
