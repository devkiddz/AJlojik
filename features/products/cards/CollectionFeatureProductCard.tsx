'use client';

import Image from 'next/image';

import { ArrowRight, Eye, Heart, LoaderCircle, ShoppingBag } from 'lucide-react';

import type { MouseEvent } from 'react';

import { Button } from '@/components/ui/button';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useWishlist } from '@/features/wishlist';

import { cn } from '@/lib/utils';

import type { BaseProductCardProps } from './productCardTypes';

import { useProductCartQuantity } from './useProductCartQuantity';

import { useProductVariant } from './useProductVariant';

export function CollectionFeatureProductCard({
  product,
  className,
  onPreview,
  onOpenExperience,
  onAddToCart
}: BaseProductCardProps) {
  const { selectedVariant, selectedVariantId, setSelectedVariantId, soldOut } = useProductVariant(product);

  const { quantity, cartMutating } = useProductCartQuantity(product.id);

  const { toggleWishlist, isWishlisted, isMutating } = useWishlist();

  if (!selectedVariant) {
    return null;
  }

  const saved = isWishlisted(product.id);

  const wishlistMutating = isMutating(product.id);

  const selectedVariantOutOfStock = selectedVariant.stockLeft <= 0;

  const discountPercentage = product.discountPercentage ?? 0;

  const badgeLabel = soldOut
    ? 'Sold out'
    : discountPercentage > 0
      ? `${discountPercentage}% off`
      : 'Featured';

  const openProductExperience = () => {
    onOpenExperience?.(product);
  };

  const stopActionEvent = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handlePreview = (event: MouseEvent<HTMLButtonElement>) => {
    stopActionEvent(event);

    onPreview?.(product);
  };

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    stopActionEvent(event);

    if (selectedVariantOutOfStock || cartMutating || !onAddToCart) {
      return;
    }

    onAddToCart(product, selectedVariant);
  };

  const handleWishlist = (event: MouseEvent<HTMLButtonElement>) => {
    stopActionEvent(event);

    if (wishlistMutating) {
      return;
    }

    void toggleWishlist({
      id: product.id,
      name: product.name
    });
  };

  return (
    <article
      className={cn(
        'group grid h-full min-h-64 min-w-0',
        'items-stretch overflow-hidden rounded-3xl',
        'border border-border/60 bg-card shadow-lg',
        className
      )}
      style={{
        gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 7fr)'
      }}>
      {/* ============================================
          IMAGE — LEFT 5 / 12
      ============================================ */}

      {/* ============================================
    IMAGE — LEFT 5 / 12
============================================ */}

      <div className="relative min-h-64 min-w-0 overflow-hidden bg-muted/50">
        <button
          type="button"
          aria-label={`Open ${product.name} experience`}
          onClick={openProductExperience}
          className={cn(
            'relative z-10 flex h-full min-h-64 w-full',
            'items-center justify-center overflow-hidden p-2',
            'sm:p-3',
            'focus-visible:outline-none',
            'focus-visible:ring-2',
            'focus-visible:ring-inset',
            'focus-visible:ring-ring'
          )}>
          <Image
            src={selectedVariant.image}
            alt={product.name}
            width={720}
            height={720}
            priority
            className={cn(
              'h-full max-h-72 w-full object-contain',
              'transition-transform duration-700',
              'group-hover:scale-[1.035]'
            )}
          />
        </button>

        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

        <span
          className={cn(
            'pointer-events-none absolute left-2 top-2 z-20',
            'rounded-full px-2 py-1',
            'text-[0.55rem] font-black uppercase tracking-wide',
            'shadow-lg backdrop-blur-md',
            'sm:left-3 sm:top-3 sm:px-2.5 sm:text-[0.62rem]',

            soldOut
              ? 'border border-white/15 bg-black/75 text-white'
              : 'border border-white/10 bg-black/55 text-white'
          )}>
          {badgeLabel}
        </span>

        <div
          className={cn(
            'absolute bottom-2 left-2 right-2 z-30',
            'flex items-center justify-end gap-1.5',
            'sm:bottom-3 sm:left-3 sm:right-3 sm:gap-2'
          )}>
          {/* Preview and wishlist buttons */}
        </div>
      </div>

      {/* ============================================
          DETAILS — RIGHT 7 / 12
      ============================================ */}

      <div
        className={cn(
          'flex min-h-0 min-w-0 flex-col justify-center',
          'overflow-hidden bg-card p-2.5',
          'sm:p-4'
        )}>
        <button
          type="button"
          onClick={openProductExperience}
          className={cn(
            'min-w-0 text-left',
            'focus-visible:outline-none',
            'focus-visible:ring-2',
            'focus-visible:ring-ring'
          )}>
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-px w-4 shrink-0 bg-border sm:w-7" />

            <p
              className={cn(
                'truncate text-[0.5rem] font-semibold uppercase',
                'tracking-[0.14em] text-muted-foreground',
                'sm:text-[0.62rem] sm:tracking-[0.2em]'
              )}>
              Featured product
            </p>
          </div>

          <h2
            className={cn(
              'mt-2 line-clamp-2',
              'text-sm font-bold leading-tight tracking-tight',
              'text-card-foreground',
              'sm:mt-3 sm:text-xl'
            )}>
            {product.name}
          </h2>

          <p
            className={cn(
              'mt-1 line-clamp-2 text-[0.65rem] leading-4',
              'text-muted-foreground',
              'sm:mt-2 sm:text-xs sm:leading-5'
            )}>
            {product.shortDescription}
          </p>
        </button>

        {/* ============================================
            OPTION AND PRICE
        ============================================ */}

        <div
          className={cn(
            'mt-2.5 grid min-w-0 grid-cols-1 gap-2',
            'sm:mt-4',
            'sm:grid-cols-[minmax(0,1fr)_auto]',
            'sm:items-end sm:gap-3'
          )}>
          <div className="min-w-0">
            <p className="mb-1 text-[0.5rem] font-semibold uppercase tracking-wide text-muted-foreground sm:text-[0.58rem]">
              Product option
            </p>

            <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
              <SelectTrigger className="h-8 w-full rounded-lg px-2 text-[0.65rem] sm:h-9 sm:rounded-xl sm:px-3 sm:text-xs">
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

          <div className="min-w-0 sm:shrink-0 sm:text-right">
            <p className="hidden text-[0.58rem] font-semibold uppercase tracking-wide text-muted-foreground sm:block">
              Price
            </p>

            <p className="truncate text-sm font-bold tracking-tight text-card-foreground sm:mt-1 sm:text-lg">
              ₦{selectedVariant.price.toLocaleString()}
            </p>
          </div>
        </div>

        {/* ============================================
            PRIMARY ACTIONS
        ============================================ */}

        <div className="mt-2.5 flex min-w-0 items-center gap-1.5 sm:mt-4 sm:gap-2">
          <Button
            type="button"
            onClick={openProductExperience}
            className={cn(
              'h-8 min-w-0 flex-1 justify-between rounded-full px-2.5',
              'bg-foreground text-background',
              'hover:bg-foreground/90',
              'sm:h-10 sm:px-4'
            )}>
            <span className="truncate text-[0.65rem] font-medium sm:text-xs">
              Explore
              <span className="hidden sm:inline"> product</span>
            </span>

            <ArrowRight className="size-3.5 shrink-0 sm:size-4" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="outline"
            title={selectedVariantOutOfStock ? 'Selected option is unavailable' : 'Add to cart'}
            aria-label={
              selectedVariantOutOfStock ? `${product.name} is unavailable` : `Add ${product.name} to cart`
            }
            disabled={selectedVariantOutOfStock || cartMutating || !onAddToCart}
            onClick={handleAddToCart}
            className="relative size-8 shrink-0 rounded-full sm:size-10">
            {cartMutating ? (
              <LoaderCircle className="size-3.5 animate-spin sm:size-4" />
            ) : (
              <ShoppingBag className="size-3.5 sm:size-4" />
            )}

            {quantity > 0 ? (
              <span
                className={cn(
                  'absolute -right-1 -top-1',
                  'grid min-h-4 min-w-4 place-items-center',
                  'rounded-full bg-primary px-1',
                  'text-[0.5rem] font-black text-primary-foreground',
                  'shadow-md',
                  'sm:-right-1.5 sm:-top-1.5',
                  'sm:min-h-5 sm:min-w-5',
                  'sm:text-[0.6rem]'
                )}>
                {quantity}
              </span>
            ) : null}
          </Button>
        </div>
      </div>
    </article>
  );
}
