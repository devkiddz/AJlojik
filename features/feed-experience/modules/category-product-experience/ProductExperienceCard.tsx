'use client';

import Image from 'next/image';

import { useMemo } from 'react';

import { Eye, Heart, ShoppingCart, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import type { FeedActions } from '@/features/feed-experience/contracts';

import { useProductVariant } from '@/features/products/cards/useProductVariant';

import { cn } from '@/lib/utils';

import type { ProductType } from '@/types/types';

type ProductExperienceCardProps = {
  product: ProductType;
  actions: FeedActions;

  locale?: string;
  currency?: string;

  className?: string;
};

export default function ProductExperienceCard({
  product,
  actions,
  locale = 'en-NG',
  currency = 'NGN',
  className
}: ProductExperienceCardProps) {
  const { selectedVariant, selectedVariantId, setSelectedVariantId } = useProductVariant(product);

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

  const openProductExperience = (): void => {
    actions.openExperience({
      type: 'product',
      productId: product.id
    });
  };

  const handlePreview = (): void => {
    actions.previewProduct(product);
  };

  const handleAddToCart = (): void => {
    if (outOfStock) {
      return;
    }

    actions.addToCart(product, selectedVariant);
  };

  return (
    <article
      className={cn(
        'group flex h-full w-44 shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm',
        'transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl',
        'sm:w-48 lg:w-52',
        className
      )}>
      {/* Artwork */}

      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={selectedVariant.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 176px, 208px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        <button
          type="button"
          onClick={openProductExperience}
          aria-label={`Open ${product.name} experience`}
          className="absolute inset-0 z-10"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/5" />

        {/* Badges */}

        <div className="pointer-events-none absolute left-2 top-2 z-20 flex max-w-[65%] flex-wrap gap-1">
          {product.discountPercentage > 0 ? (
            <span className="rounded-full bg-secondary px-2 py-1 text-[9px] font-bold text-secondary-foreground shadow-md">
              -{product.discountPercentage}%
            </span>
          ) : null}

          {product.isNew ? (
            <span className="rounded-full border border-white/15 bg-black/40 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur-md">
              New
            </span>
          ) : null}
        </div>

        {/* Quick actions */}

        <div className="absolute right-2 top-2 z-20 flex flex-col gap-1.5">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={product.liked ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={product.liked}
            onClick={() => actions.toggleLike(product.id)}
            className="size-8 rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md hover:bg-black/60 hover:text-white">
            <Heart className={cn('size-3.5', product.liked && 'fill-current text-rose-300')} />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={`Preview ${product.name}`}
            onClick={handlePreview}
            className="size-8 rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md hover:bg-black/60 hover:text-white">
            <Eye className="size-3.5" />
          </Button>
        </div>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20">
          <p className="truncate text-[9px] font-semibold uppercase tracking-[0.16em] text-white/65">
            {product.category}
          </p>
        </div>
      </div>

      {/* Information */}

      <div className="flex flex-1 flex-col p-3">
        <button type="button" onClick={openProductExperience} className="text-left">
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 tracking-tight">
            {product.name}
          </h3>
        </button>

        <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
          <Star className="size-3 fill-amber-400 text-amber-400" />

          <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>

          <span>({product.reviews})</span>

          <span className="mx-1 size-1 rounded-full bg-border" />

          <span>{product.soldCount} sold</span>
        </div>

        <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-muted-foreground">
          {product.shortDescription}
        </p>

        <div className="mt-auto space-y-2 pt-3">
          <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
            <SelectTrigger className="h-8 w-full rounded-lg text-[10px]">
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

          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">
                {priceFormatter.format(Number(selectedVariant.price))}
              </p>

              <p
                className={cn(
                  'mt-0.5 text-[9px]',
                  outOfStock ? 'text-destructive' : 'text-muted-foreground'
                )}>
                {outOfStock ? 'Out of stock' : `${selectedVariant.stockLeft} available`}
              </p>
            </div>

            <Button
              type="button"
              size="icon"
              disabled={outOfStock}
              onClick={handleAddToCart}
              aria-label={`Add ${product.name} to cart`}
              className="size-8 shrink-0 rounded-full">
              <ShoppingCart className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
