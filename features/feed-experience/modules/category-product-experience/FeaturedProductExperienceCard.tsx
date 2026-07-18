'use client';

import Image from 'next/image';

import { useMemo } from 'react';

import { ArrowUpRight, Eye, Heart, ShoppingCart, Sparkles, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import type { FeedActions } from '@/features/feed-experience/contracts';

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

  const handleAddToCart = (): void => {
    if (outOfStock) {
      return;
    }

    actions.addToCart(product, selectedVariant);
  };

  return (
    <article className="group relative isolate h-full min-h-96 overflow-hidden rounded-2xl border border-white/10 bg-[#07101e] text-white shadow-xl">
      <Image
        src={selectedVariant.image}
        alt={product.name}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 36vw"
        className="object-cover transition duration-700 group-hover:scale-105"
      />

      <button
        type="button"
        onClick={openProductExperience}
        aria-label={`Open ${product.name} experience`}
        className="absolute inset-0 z-10"
      />

      <div className="pointer-events-none absolute inset-0 bg-black/20" />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/5" />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent" />

      <div className="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full bg-secondary/25 blur-3xl" />

      <div className="pointer-events-none relative z-20 flex min-h-96 flex-col justify-between p-4 sm:p-5">
        {/* Header */}

        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/30 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.15em] backdrop-blur-xl">
            <Sparkles className="size-3" />
            Featured experience
          </span>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={product.liked ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={product.liked}
            onClick={() => actions.toggleLike(product.id)}
            className="pointer-events-auto size-9 rounded-full border border-white/15 bg-black/30 text-white backdrop-blur-xl hover:bg-black/50 hover:text-white">
            <Heart className={cn('size-4', product.liked && 'fill-current text-rose-300')} />
          </Button>
        </div>

        {/* Content */}

        <div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-white/65">
            <span className="capitalize">{product.category}</span>

            <span className="size-1 rounded-full bg-white/30" />

            <span className="inline-flex items-center gap-1">
              <Star className="size-3 fill-amber-300 text-amber-300" />

              {product.rating.toFixed(1)}
            </span>

            <span className="size-1 rounded-full bg-white/30" />

            <span>{product.soldCount.toLocaleString()} sold</span>
          </div>

          <h3 className="mt-2 line-clamp-2 text-2xl font-bold leading-tight tracking-tight">
            {title ?? product.name}
          </h3>

          <p className="mt-2 line-clamp-3 text-xs leading-5 text-white/70">
            {product.longDescription || product.shortDescription}
          </p>

          <div className="pointer-events-auto mt-4">
            <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
              <SelectTrigger className="h-9 w-full border-white/15 bg-black/30 text-xs text-white backdrop-blur-xl">
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

          <div className="mt-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/50">
                Selected price
              </p>

              <p className="mt-1 text-xl font-bold">{priceFormatter.format(Number(selectedVariant.price))}</p>

              <p className={cn('mt-1 text-[10px]', outOfStock ? 'text-red-300' : 'text-emerald-300')}>
                {outOfStock ? 'Currently unavailable' : `${selectedVariant.stockLeft} available`}
              </p>
            </div>

            <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[9px] font-medium text-white/70 backdrop-blur-xl">
              {selectedVariant.label}
            </span>
          </div>

          <div className="pointer-events-auto mt-4 grid grid-cols-[minmax(0,1fr)_2.5rem_2.5rem] gap-2">
            <Button
              type="button"
              disabled={outOfStock}
              onClick={handleAddToCart}
              className="h-10 min-w-0 rounded-full bg-white px-4 text-xs font-semibold text-black hover:bg-white/90">
              <ShoppingCart className="size-4" />

              <span className="truncate">Add to cart</span>
            </Button>

            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => actions.previewProduct(product)}
              aria-label={`Preview ${product.name}`}
              className="size-10 rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-xl hover:bg-white/15 hover:text-white">
              <Eye className="size-4" />
            </Button>

            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={openProductExperience}
              aria-label={`Open full ${product.name} experience`}
              className="size-10 rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-xl hover:bg-white/15 hover:text-white">
              <ArrowUpRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
