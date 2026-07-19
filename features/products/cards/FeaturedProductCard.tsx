'use client';

import Image from 'next/image';

import { Eye, Heart, LoaderCircle, ShoppingBag, Star } from 'lucide-react';

import type { MouseEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWishlist } from '@/features/wishlist';
import { cn } from '@/lib/utils';

import { PremiumCardSurface } from './PremiumCardSurface';
import { ProductStatusBadges } from './ProductStatusBadges';
import type { BaseProductCardProps } from './productCardTypes';
import { useProductCartQuantity } from './useProductCartQuantity';
import { useProductVariant } from './useProductVariant';

type FeaturedProductCardPresentation = 'hero' | 'collection';

type FeaturedProductCardProps = BaseProductCardProps & {
  presentation?: FeaturedProductCardPresentation;
};

const currencyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0
});

export function FeaturedProductCard({
  product,
  className,
  presentation = 'hero',
  onPreview,
  onOpenExperience,
  onAddToCart
}: FeaturedProductCardProps) {
  const { selectedVariant, selectedVariantId, setSelectedVariantId } = useProductVariant(product);
  const { quantity, cartMutating } = useProductCartQuantity(product.id);
  const { toggleWishlist, isWishlisted, isMutating } = useWishlist();

  if (!selectedVariant) {
    return null;
  }

  const compact = presentation === 'collection';
  const saved = isWishlisted(product.id);
  const wishlistMutating = isMutating(product.id);
  const outOfStock = selectedVariant.stockLeft <= 0;
  const lowStock = !outOfStock && selectedVariant.stockLeft <= 5;

  const stopEvent = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handlePreview = (event: MouseEvent<HTMLElement>) => {
    stopEvent(event);
    onPreview?.(product);
  };

  const handleAddToCart = (event: MouseEvent<HTMLElement>) => {
    stopEvent(event);

    if (outOfStock || cartMutating || !onAddToCart) {
      return;
    }

    onAddToCart(product, selectedVariant);
  };

  const handleWishlist = (event: MouseEvent<HTMLElement>) => {
    stopEvent(event);

    if (wishlistMutating) {
      return;
    }

    void toggleWishlist({ id: product.id, name: product.name });
  };

  return (
    <PremiumCardSurface
      glowSize={compact ? 360 : 520}
      className={cn(
        'group overflow-hidden rounded-[1.75rem] border border-border/60 bg-card',
        'shadow-[0_20px_60px_-34px_rgba(0,0,0,0.55)]',
        'transition duration-300 hover:border-border hover:shadow-[0_26px_70px_-32px_rgba(0,0,0,0.65)]',
        className
      )}>
      <article
        className={cn(
          'grid min-w-0',
          compact
            ? 'grid-cols-[minmax(7.5rem,0.82fr)_minmax(0,1.18fr)] sm:grid-cols-[minmax(10rem,0.85fr)_minmax(0,1.15fr)]'
            : 'grid-cols-1 md:min-h-[25rem] md:grid-cols-[minmax(17rem,0.9fr)_minmax(0,1.1fr)]'
        )}>
        <div
          className={cn(
            'relative overflow-hidden bg-muted',
            compact ? 'min-h-72 sm:min-h-80' : 'aspect-[16/10] min-h-64 md:aspect-auto md:min-h-full'
          )}>
          <Image
            src={selectedVariant.image}
            alt={product.name}
            fill
            priority={!compact}
            sizes={compact ? '(max-width: 640px) 42vw, 24vw' : '(max-width: 768px) 100vw, 42vw'}
            className="object-cover object-center transition duration-700 ease-out group-hover:scale-[1.035]"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-black/10" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.16),transparent_38%)]" />

          <button
            type="button"
            aria-label={`Open ${product.name} experience`}
            onClick={() => onOpenExperience?.(product)}
            className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80">
            <span className="sr-only">Open {product.name}</span>
          </button>

          <ProductStatusBadges product={product} />

          <div className={cn('pointer-events-none absolute inset-x-0 bottom-0 z-20', compact ? 'p-3' : 'p-5')}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65">
              Featured selection
            </p>
            {!compact ? (
              <p className="mt-1 line-clamp-1 text-sm font-semibold text-white/95">{selectedVariant.label}</p>
            ) : null}
          </div>
        </div>

        <div className={cn('flex min-w-0 flex-col', compact ? 'p-4 sm:p-5' : 'p-5 sm:p-7 lg:p-8')}>
          <button
            type="button"
            onClick={() => onOpenExperience?.(product)}
            className="min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-[10px] font-medium text-muted-foreground">
              <span className="truncate font-semibold uppercase tracking-[0.16em] text-primary/70">
                {product.category.replaceAll('-', ' ')}
              </span>
              <span className="size-1 rounded-full bg-border" />
              <span className="inline-flex items-center gap-1">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                {product.rating.toFixed(1)}
              </span>
              {!compact ? (
                <>
                  <span className="size-1 rounded-full bg-border" />
                  <span>{product.soldCount.toLocaleString()} sold</span>
                </>
              ) : null}
            </div>

            <h2
              className={cn(
                'mt-3 line-clamp-2 font-bold leading-tight tracking-tight text-card-foreground',
                compact ? 'text-lg' : 'text-2xl sm:text-3xl lg:text-4xl'
              )}>
              {product.name}
            </h2>

            <p
              className={cn(
                'mt-3 text-muted-foreground',
                compact ? 'line-clamp-2 text-xs leading-5' : 'line-clamp-3 text-sm leading-6'
              )}>
              {product.shortDescription}
            </p>
          </button>

          <div className={cn('mt-auto', compact ? 'pt-4' : 'pt-7')}>
            <div className={cn('grid items-end gap-3', compact ? 'grid-cols-1' : 'sm:grid-cols-[minmax(0,1fr)_auto]')}>
              <div className="min-w-0">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Choose option
                </p>
                <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
                  <SelectTrigger className={cn('w-full rounded-xl bg-background/60', compact ? 'h-9' : 'h-10 sm:max-w-64')}>
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

              <div className={cn('min-w-0', compact ? 'text-left' : 'sm:text-right')}>
                <p className={cn('font-bold tracking-tight text-card-foreground', compact ? 'text-lg' : 'text-2xl')}>
                  {currencyFormatter.format(selectedVariant.price)}
                </p>
                <p
                  className={cn(
                    'mt-1 text-[10px] font-medium',
                    outOfStock ? 'text-destructive' : lowStock ? 'text-amber-600' : 'text-emerald-600'
                  )}>
                  {outOfStock ? 'Currently unavailable' : lowStock ? `Only ${selectedVariant.stockLeft} left` : 'Ready to order'}
                </p>
              </div>
            </div>

            <div className={cn('mt-4 grid items-center gap-2', 'grid-cols-[minmax(0,1fr)_2.5rem_2.5rem]')}>
              <Button
                type="button"
                disabled={outOfStock || cartMutating || !onAddToCart}
                onClick={handleAddToCart}
                className="relative h-10 min-w-0 gap-2 rounded-full bg-foreground px-4 text-background hover:bg-foreground/90">
                {cartMutating ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <ShoppingBag className="size-4" />
                )}
                <span className="truncate text-xs">{outOfStock ? 'Out of stock' : 'Add to cart'}</span>
                {quantity > 0 ? (
                  <span className="rounded-full bg-background/15 px-1.5 py-0.5 text-[10px] font-black">{quantity}</span>
                ) : null}
              </Button>

              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handlePreview}
                aria-label={`Preview ${product.name}`}
                title="Quick preview"
                className="size-10 rounded-full bg-background/60">
                <Eye className="size-4" />
              </Button>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-pressed={saved}
                aria-label={saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                disabled={wishlistMutating}
                onClick={handleWishlist}
                className={cn(
                  'size-10 rounded-full border border-border/60 bg-background/40',
                  saved && 'border-rose-500/30 text-rose-500'
                )}>
                {wishlistMutating ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Heart className={cn('size-4', saved && 'fill-current')} />
                )}
              </Button>
            </div>
          </div>
        </div>
      </article>
    </PremiumCardSurface>
  );
}
