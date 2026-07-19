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

type FeaturedProductCardPresentation = 'hero' | 'collection';

type FeaturedProductCardProps = BaseProductCardProps & {
  presentation?: FeaturedProductCardPresentation;
};

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

  const isCollectionPresentation = presentation === 'collection';

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

  const handlePreview = (event: MouseEvent<HTMLElement>) => {
    stopEvent(event);
    onPreview?.(product);
  };

  const handleAddToCart = (event: MouseEvent<HTMLElement>) => {
    stopEvent(event);

    onAddToCart?.(product, selectedVariant);
  };

  const handleWishlist = (event: MouseEvent<HTMLElement>) => {
    stopEvent(event);

    void toggleWishlist({
      id: product.id,
      name: product.name
    });
  };

  // ==========================================================
  // COMPACT COLLECTION PRESENTATION
  // ==========================================================

  if (isCollectionPresentation) {
    return (
      <PremiumCardSurface
        glowSize={360}
        className={cn(
          'group h-auto self-start overflow-hidden rounded-3xl',
          'border border-border/60 bg-card shadow-lg',
          className
        )}>
        <article className="flex min-h-80 min-w-0 overflow-hidden">
          {/* Product image — left */}

          <div className="relative w-2/5 shrink-0 overflow-hidden bg-muted">
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
              sizes="(max-width: 1024px) 40vw, 18vw"
              className="object-contain p-3 transition-transform duration-700 group-hover:scale-[1.02]"
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

            <ProductStatusBadges product={product} />
          </div>

          {/* Product information — right */}

          <div className="flex min-w-0 flex-1 flex-col p-4">
            <button
              type="button"
              aria-label={`Open ${product.name} experience`}
              onClick={openProductExperience}
              className="min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-px w-6 shrink-0 bg-border" />

                <p className="truncate text-[0.65rem] font-semibold uppercase tracking-widest text-primary/60">
                  {product.category}
                </p>
              </div>

              <h2 className="mt-3 line-clamp-2 text-lg font-bold leading-tight tracking-tight text-card-foreground">
                {product.name}
              </h2>

              <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                {product.shortDescription}
              </p>
            </button>

            <div className="mt-auto pt-4">
              <p className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
                Selected option
              </p>

              <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
                <SelectTrigger className="mt-2 h-9 w-full rounded-xl px-3">
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

              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="text-xs text-muted-foreground">Price</p>

                <p className="whitespace-nowrap text-lg font-bold tracking-tight text-card-foreground">
                  ₦{selectedVariant.price.toLocaleString()}
                </p>
              </div>

              <div className="mt-4 flex min-w-0 items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  aria-label={`Preview ${product.name}`}
                  className="size-9 shrink-0 rounded-full p-0"
                  onClick={handlePreview}>
                  <Eye className="size-4" />
                </Button>

                <Button
                  type="button"
                  className="relative h-9 min-w-0 flex-1 gap-2 rounded-full px-3"
                  disabled={outOfStock || cartMutating || !onAddToCart}
                  onClick={handleAddToCart}>
                  {cartMutating ? (
                    <LoaderCircle className="size-4 shrink-0 animate-spin" />
                  ) : (
                    <ShoppingBag className="size-4 shrink-0" />
                  )}

                  <span className="truncate text-xs">{outOfStock ? 'Out of stock' : 'Add to cart'}</span>

                  {quantity > 0 ? (
                    <span className="shrink-0 rounded-full bg-primary-foreground/15 px-1.5 py-0.5 text-[0.65rem] font-black">
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
                  className={cn('size-9 shrink-0 rounded-full p-0', saved && 'text-primary')}
                  onClick={handleWishlist}>
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

  // ==========================================================
  // LARGE HERO PRESENTATION
  // ==========================================================

  return (
    <PremiumCardSurface
      glowSize={520}
      className={cn(
        'group overflow-hidden rounded-3xl border border-border/60 bg-card shadow-lg',
        className
      )}>
      <div className="grid h-full min-h-96 grid-cols-1 md:grid-cols-2">
        {/* Product image — left */}

        <div className="relative min-h-64 overflow-hidden bg-muted md:min-h-96">
          <button
            type="button"
            aria-label={`Open ${product.name} experience`}
            onClick={openProductExperience}
            className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
            <span className="sr-only">Open {product.name}</span>
          </button>

          <div className="aspect-5/2">
            <Image
              src={selectedVariant.image}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          <ProductStatusBadges product={product} />
        </div>

        {/* Product information — right */}

        <div className="flex min-w-0 flex-col p-6 md:p-8">
          <button
            type="button"
            aria-label={`Open ${product.name} experience`}
            onClick={openProductExperience}
            className="min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/60">
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
              <Button type="button" variant="outline" className="gap-2 rounded-full" onClick={handlePreview}>
                <Eye className="size-4" />
                Preview
              </Button>

              <Button
                type="button"
                className="relative gap-2 rounded-full"
                disabled={outOfStock || cartMutating || !onAddToCart}
                onClick={handleAddToCart}>
                {cartMutating ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <ShoppingBag className="size-4" />
                )}

                {outOfStock ? 'Out of stock' : 'Add to cart'}

                {quantity > 0 ? (
                  <span className="rounded-full bg-primary-foreground/15 px-1.5 py-0.5 text-[0.65rem] font-black">
                    +{quantity}
                  </span>
                ) : null}
              </Button>

              <Button
                type="button"
                variant="ghost"
                aria-pressed={saved}
                disabled={wishlistMutating}
                className={cn('gap-2 rounded-full', saved && 'text-primary')}
                onClick={handleWishlist}>
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
