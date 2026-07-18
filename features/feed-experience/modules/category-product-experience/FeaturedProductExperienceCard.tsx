'use client';

import Image from 'next/image';

import { useMemo, type MouseEvent } from 'react';

import { Eye, Heart, ShoppingBag, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import type { FeedActions } from '@/features/feed-experience/contracts';

import { PremiumCardSurface, ProductStatusBadges } from '@/features/products/cards';

import { useProductCartQuantity } from '@/features/products/cards/useProductCartQuantity';

import { useProductVariant } from '@/features/products/cards/useProductVariant';

import { cn } from '@/lib/utils';

import type { ProductType } from '@/types/types';

type FeaturedProductExperienceCardProps = {
  product: ProductType;
  actions: FeedActions;

  locale?: string;
  currency?: string;

  title?: string;
};

export default function FeaturedProductExperienceCard({
  product,
  actions,
  locale = 'en-NG',
  currency = 'NGN',
  title
}: FeaturedProductExperienceCardProps) {
  const { selectedVariant, selectedVariantId, setSelectedVariantId } = useProductVariant(product);

  const { quantity, cartMutating } = useProductCartQuantity(product.id);

  const priceFormatter = useMemo(() => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 0
      });
    } catch {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0
      });
    }
  }, [currency, locale]);

  if (!selectedVariant) {
    return null;
  }

  const outOfStock = selectedVariant.stockLeft <= 0;

  const displayTitle = title ?? product.name;

  const openProductExperience = (): void => {
    actions.openExperience({
      type: 'product',
      productId: product.id
    });
  };

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    if (outOfStock || cartMutating) {
      return;
    }

    actions.addToCart(product, selectedVariant);
  };

  const handlePreview = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    actions.previewProduct(product);
  };

  const handleWishlist = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    actions.toggleLike(product.id);
  };

  return (
    <PremiumCardSurface
      glowSize={460}
      className={cn('group h-full min-h-[26rem] rounded-3xl', 'border border-border/60 bg-card shadow-lg')}>
      <div
        className={cn('grid h-full min-h-[26rem]', 'md:grid-cols-[minmax(0,1.05fr)_minmax(19rem,0.95fr)]')}>
        {/* IMAGE — LEFT */}

        <div className="relative min-h-72 overflow-hidden bg-muted md:min-h-full">
          <button
            type="button"
            onClick={openProductExperience}
            aria-label={`Open ${product.name} experience`}
            className={cn(
              'absolute inset-0 z-10',
              'cursor-pointer',
              'focus-visible:outline-none',
              'focus-visible:ring-2',
              'focus-visible:ring-inset',
              'focus-visible:ring-ring'
            )}>
            <span className="sr-only">Open {product.name} experience</span>
          </button>

          <Image
            src={selectedVariant.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 36vw"
            className={cn('object-cover', 'transition duration-700', 'group-hover:scale-[1.025]')}
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          <ProductStatusBadges product={product} />
        </div>

        {/* DETAILS — RIGHT */}

        <div className="flex min-w-0 flex-col bg-card/95 p-5 lg:p-6">
          <button
            type="button"
            onClick={openProductExperience}
            className={cn(
              'w-full text-left',
              'focus-visible:outline-none',
              'focus-visible:ring-2',
              'focus-visible:ring-ring'
            )}>
            <div className="flex flex-wrap items-center gap-2 text-[0.7rem] text-muted-foreground">
              <span className="font-semibold uppercase tracking-[0.16em] text-primary/60">
                {product.category}
              </span>

              <span className="size-1 rounded-full bg-border" />

              <span className="inline-flex items-center gap-1">
                <Star className="size-3 fill-amber-400 text-amber-400" />

                {product.rating.toFixed(1)}
              </span>

              <span className="size-1 rounded-full bg-border" />

              <span>{product.soldCount.toLocaleString()} sold</span>
            </div>

            <h3 className="mt-4 line-clamp-2 text-2xl font-bold leading-tight tracking-tight text-card-foreground">
              {displayTitle}
            </h3>

            <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {product.shortDescription || product.longDescription}
            </p>
          </button>

          <div className="mt-auto pt-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
              <div className="min-w-0">
                <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Product option
                </p>

                <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
                  <SelectTrigger className="h-9 w-full rounded-xl">
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
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Price
                </p>

                <p className="mt-1 whitespace-nowrap text-xl font-bold tracking-tight text-card-foreground">
                  {priceFormatter.format(Number(selectedVariant.price))}
                </p>

                <p
                  className={cn(
                    'mt-1 whitespace-nowrap text-[0.68rem]',

                    outOfStock ? 'text-destructive' : 'text-emerald-600'
                  )}>
                  {outOfStock ? 'Unavailable' : `${selectedVariant.stockLeft} available`}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-[minmax(0,1fr)_2.5rem_2.5rem] gap-2">
              <Button
                type="button"
                disabled={outOfStock || cartMutating}
                onClick={handleAddToCart}
                className={cn(
                  'relative h-10 min-w-0 gap-2 rounded-full px-4',
                  'bg-foreground text-background',
                  'hover:bg-foreground/90'
                )}>
                <ShoppingBag className="size-4 shrink-0" />

                <span className="truncate">{outOfStock ? 'Out of stock' : 'Add to cart'}</span>

                {quantity > 0 ? (
                  <span className="shrink-0 rounded-full bg-background/15 px-1.5 py-0.5 text-[0.62rem] font-black">
                    +{quantity}
                  </span>
                ) : null}
              </Button>

              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handlePreview}
                aria-label={`Preview ${product.name}`}
                title="Quick preview"
                className="size-10 rounded-full">
                <Eye className="size-4" />
              </Button>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-pressed={product.liked}
                aria-label={
                  product.liked ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`
                }
                title="Wishlist"
                onClick={handleWishlist}
                className={cn(
                  'size-10 rounded-full border border-border/60',

                  product.liked && 'border-rose-500/30 text-rose-500'
                )}>
                <Heart
                  className={cn(
                    'size-4',

                    product.liked && 'fill-current'
                  )}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PremiumCardSurface>
  );
}
