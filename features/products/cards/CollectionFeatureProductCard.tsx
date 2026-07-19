'use client';

import Image from 'next/image';

import { Eye, Heart, LoaderCircle, ShoppingBag } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useWishlist } from '@/features/wishlist';

import { cn } from '@/lib/utils';

import type { BaseProductCardProps } from './productCardTypes';

import { PremiumCardSurface } from './PremiumCardSurface';

import { ProductStatusBadges } from './ProductStatusBadges';

import { useProductCartQuantity } from './useProductCartQuantity';

import { useProductVariant } from './useProductVariant';

export function CollectionFeatureProductCard({
  product,
  className,
  onPreview,
  onOpenExperience,
  onAddToCart
}: BaseProductCardProps) {
  const { selectedVariant, selectedVariantId, setSelectedVariantId } = useProductVariant(product);

  const { quantity, cartMutating } = useProductCartQuantity(product.id);

  const { toggleWishlist, isWishlisted, isMutating } = useWishlist();

  if (!selectedVariant) {
    return null;
  }

  const saved = isWishlisted(product.id);

  const wishlistMutating = isMutating(product.id);

  const outOfStock = selectedVariant.stockLeft <= 0;

  const openProductExperience = () => {
    onOpenExperience?.(product);
  };

  return (
    <PremiumCardSurface
      glowSize={360}
      className={cn(
        'group h-auto min-w-0 overflow-hidden rounded-3xl lg:h-full',
        'border border-border/60 bg-card shadow-lg',
        className
      )}>
      <article
        className={cn(
          'grid h-auto min-w-0 grid-cols-1',
          'sm:min-h-52 sm:grid-cols-2',
          'lg:h-full lg:min-h-0'
        )}>
        {/* ============================================
            PRODUCT IMAGE — LEFT
        ============================================ */}

        <div className="relative min-h-52 overflow-hidden bg-muted/40 sm:min-h-0">
          <button
            type="button"
            aria-label={`Open ${product.name} experience`}
            onClick={openProductExperience}
            className={cn(
              'absolute inset-0 z-10 cursor-pointer',
              'focus-visible:outline-none',
              'focus-visible:ring-2',
              'focus-visible:ring-inset',
              'focus-visible:ring-ring'
            )}>
            <span className="sr-only">Open {product.name}</span>
          </button>

          <Image
            src={selectedVariant.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 26vw"
            className={cn(
              'object-contain p-2',
              'transition-transform duration-500',
              'group-hover:scale-[1.025]'
            )}
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          <ProductStatusBadges product={product} />
        </div>

        {/* ============================================
            CENTERED PRODUCT CONTENT — RIGHT
        ============================================ */}

        <div className="flex min-h-0 min-w-0 flex-col justify-center p-3 sm:p-4">
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
              <span className="h-px w-6 shrink-0 bg-border" />

              <p className="truncate text-[0.65rem] font-semibold uppercase tracking-widest text-primary/60">
                {product.category}
              </p>
            </div>

            <h2 className="mt-2 line-clamp-2 text-lg font-bold leading-tight tracking-tight text-card-foreground">
              {product.name}
            </h2>

            <p className="mt-1.5 line-clamp-1 text-xs leading-5 text-muted-foreground">
              {product.shortDescription}
            </p>
          </button>

          {/* ============================================
              COMPACT COMMERCE CONTROLS
          ============================================ */}

          <div className="mt-3">
            <div className="flex min-w-0 items-end gap-3">
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[0.6rem] font-medium uppercase tracking-wide text-muted-foreground">
                  Selected option
                </p>

                <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
                  <SelectTrigger className="h-8 w-full rounded-xl px-3 text-xs">
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

              <div className="shrink-0 text-right">
                <p className="text-[0.6rem] text-muted-foreground">Price</p>

                <p className="mt-0.5 whitespace-nowrap text-lg font-bold tracking-tight text-card-foreground">
                  ₦{selectedVariant.price.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-2.5 flex min-w-0 items-center gap-2">
              <Button
                type="button"
                variant="outline"
                aria-label={`Preview ${product.name}`}
                className="size-8 shrink-0 rounded-full p-0"
                onClick={() => {
                  onPreview?.(product);
                }}>
                <Eye className="size-3.5" />
              </Button>

              <Button
                type="button"
                className="relative h-8 min-w-0 flex-1 gap-2 rounded-full px-3"
                disabled={outOfStock || cartMutating || !onAddToCart}
                onClick={() => {
                  onAddToCart?.(product, selectedVariant);
                }}>
                {cartMutating ? (
                  <LoaderCircle className="size-3.5 shrink-0 animate-spin" />
                ) : (
                  <ShoppingBag className="size-3.5 shrink-0" />
                )}

                <span className="truncate text-xs">{outOfStock ? 'Out of stock' : 'Add to cart'}</span>

                {quantity > 0 ? (
                  <span className="shrink-0 rounded-full bg-primary-foreground/15 px-1.5 py-0.5 text-[0.6rem] font-black">
                    +{quantity}
                  </span>
                ) : null}
              </Button>

              <Button
                type="button"
                variant="ghost"
                aria-label={
                  saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`
                }
                aria-pressed={saved}
                disabled={wishlistMutating}
                className={cn('size-8 shrink-0 rounded-full p-0', saved && 'text-primary')}
                onClick={() => {
                  void toggleWishlist({
                    id: product.id,
                    name: product.name
                  });
                }}>
                {wishlistMutating ? (
                  <LoaderCircle className="size-3.5 animate-spin" />
                ) : (
                  <Heart className={cn('size-3.5', saved && 'fill-current')} />
                )}
              </Button>
            </div>
          </div>
        </div>
      </article>
    </PremiumCardSurface>
  );
}
