'use client';

import Image from 'next/image';

import { Eye, Heart, LoaderCircle, ShoppingBag } from 'lucide-react';

import type { MouseEvent } from 'react';

import { Button } from '@/components/ui/button';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useWishlist } from '@/features/wishlist';

import { cn } from '@/lib/utils';

import type { BaseProductCardProps } from './productCardTypes';

import { PremiumCardSurface } from './PremiumCardSurface';

import { ProductStatusBadges } from './ProductStatusBadges';

import { useProductCartQuantity } from './useProductCartQuantity';

import { useProductVariant } from './useProductVariant';

export function FeaturedProductCard({
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

  const stopEvent = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const openProductExperience = () => {
    onOpenExperience?.(product);
  };

  return (
    <PremiumCardSurface
      glowSize={520}
      className={cn('group rounded-3xl border border-border/60 bg-card shadow-lg', className)}>
      <div className="grid h-full min-h-[28rem] md:grid-cols-[1.1fr_0.9fr]">
        {/* Product image — left */}

        <div className="relative min-h-80 overflow-hidden bg-muted md:min-h-[28rem]">
          <button
            type="button"
            aria-label={`Open ${product.name} experience`}
            onClick={openProductExperience}
            className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
            <span className="sr-only">Open {product.name}</span>
          </button>

          <Image
            src={selectedVariant.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 55vw"
            className="object-cover transition duration-700 group-hover:scale-[1.02]"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

          <ProductStatusBadges product={product} />
        </div>

        {/* Product details — right */}

        <div className="flex min-w-0 flex-col p-6 md:p-8">
          <button
            type="button"
            onClick={openProductExperience}
            className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/60">
              {product.category}
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-card-foreground md:text-4xl">
              {product.name}
            </h2>

            <p className="mt-4 line-clamp-4 text-sm leading-7 text-muted-foreground">
              {product.shortDescription}
            </p>
          </button>

          <div className="mt-auto pt-8">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Selected option
            </p>

            <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="w-full sm:max-w-52">
                <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
                  <SelectTrigger className="h-10 rounded-xl">
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

              <div className="shrink-0 sm:text-right">
                <p className="text-xs text-muted-foreground">Price</p>

                <p className="mt-1 text-2xl font-bold tracking-tight">
                  ₦{selectedVariant.price.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="gap-2 rounded-full"
                onClick={event => {
                  stopEvent(event);
                  onPreview?.(product);
                }}>
                <Eye className="size-4" />
                Preview
              </Button>

              <Button
                type="button"
                className="relative gap-2 rounded-full"
                disabled={outOfStock || cartMutating || !onAddToCart}
                onClick={event => {
                  stopEvent(event);

                  onAddToCart?.(product, selectedVariant);
                }}>
                {cartMutating ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <ShoppingBag className="size-4" />
                )}

                {outOfStock ? 'Out of stock' : 'Add to cart'}

                {quantity > 0 && (
                  <span className="rounded-full bg-primary-foreground/15 px-1.5 py-0.5 text-[0.65rem] font-black">
                    +{quantity}
                  </span>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                aria-pressed={saved}
                disabled={wishlistMutating}
                className={cn('gap-2 rounded-full', saved && 'text-primary')}
                onClick={event => {
                  stopEvent(event);

                  void toggleWishlist({
                    id: product.id,
                    name: product.name
                  });
                }}>
                {wishlistMutating ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Heart className={cn('size-4', saved && 'fill-current')} />
                )}
                Wishlist
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PremiumCardSurface>
  );
}
