'use client';

import Image from 'next/image';
import { ArrowUpRight, Heart, ShoppingBag, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { BaseProductCardProps } from './productCardTypes';
import { useProductVariant } from './useProductVariant';
export function FeaturedProductCard({
  product,
  className,
  onPreview,
  onToggleLike,
  onAddToCart
}: BaseProductCardProps) {
  const { selectedVariant, selectedVariantId, setSelectedVariantId } = useProductVariant(product);

  if (!selectedVariant) return null;

  return (
    <article
      className={cn(
        'group relative isolate min-h-[30rem] overflow-hidden rounded-3xl border',
        'bg-card shadow-xl',
        className
      )}>
      <Image
        src={selectedVariant.image}
        alt={product.name}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 70vw"
        className="object-cover transition duration-700 group-hover:scale-[1.03]"
      />

      <div className="absolute inset-0 bg-black/20" />

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/5" />

      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

      <div className="relative z-10 flex min-h-[30rem] flex-col justify-between p-5 text-white md:p-8">
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur-md">
            <Sparkles className="size-3.5" />
            Featured experience
          </span>

          <button
            type="button"
            aria-label="Save featured product"
            onClick={() => onToggleLike?.(product.id)}
            className="grid size-11 place-items-center rounded-full border border-white/15 bg-black/25 backdrop-blur-md transition hover:bg-black/50">
            <Heart className={cn('size-5', product.liked && 'fill-secondary text-secondary')} />
          </button>
        </div>

        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
            <span className="capitalize">{product.category}</span>

            <span className="flex items-center gap-1">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              {product.rating.toFixed(1)}
            </span>

            <span>{product.soldCount.toLocaleString()} sold</span>
          </div>

          <h2 className="mt-4 max-w-xl text-3xl font-black tracking-tight md:text-5xl">{product.name}</h2>

          <p className="mt-4 max-w-xl text-sm leading-7 text-white/75 md:text-base">
            {product.longDescription || product.shortDescription}
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="w-full max-w-[13rem]">
              <p className="mb-2 text-xs font-medium text-white/60">Select option</p>

              <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
                <SelectTrigger className="border-white/15 bg-black/30 text-white backdrop-blur-md">
                  <SelectValue />
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

            <div>
              <p className="text-xs text-white/60">Starting price</p>

              <p className="text-3xl font-black">₦{selectedVariant.price.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              type="button"
              size="lg"
              className="gap-2 rounded-full px-6"
              disabled={selectedVariant.stockLeft <= 0}
              onClick={() => onAddToCart?.(product, selectedVariant)}>
              <ShoppingBag className="size-4" />
              Add {selectedVariant.label}
            </Button>

            <Button
              type="button"
              size="lg"
              variant="secondary"
              className="gap-2 rounded-full border border-white/15 bg-white/10 px-6 text-white backdrop-blur-md hover:bg-white/20"
              onClick={() => onPreview?.(product)}>
              View details
              <ArrowUpRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
