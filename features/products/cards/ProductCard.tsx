'use client';

import Image from 'next/image';

import { Eye, Heart, ShoppingBag, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { cn } from '@/lib/utils';

import type { BaseProductCardProps } from './productCardTypes';

import { useProductVariant } from './useProductVariant';

export function ProductCard({
  product,
  className,
  onPreview,
  onToggleLike,
  onAddToCart
}: BaseProductCardProps) {
  const { selectedVariant, selectedVariantId, setSelectedVariantId } = useProductVariant(product);

  if (!selectedVariant) return null;

  const outOfStock = selectedVariant.stockLeft <= 0;

  return (
    <article
      className={cn(
        'group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border',
        'bg-card shadow-sm transition duration-300',
        'hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl',
        className
      )}>
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={selectedVariant.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-wrap gap-1.5">
            {product.discountPercentage > 0 && (
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[0.68rem] font-bold text-secondary-foreground shadow-sm">
                -{product.discountPercentage}%
              </span>
            )}

            {product.isNew && (
              <span className="rounded-full bg-background/90 px-2.5 py-1 text-[0.68rem] font-bold backdrop-blur-md">
                New
              </span>
            )}
          </div>

          <button
            type="button"
            aria-label="Save product"
            onClick={() => onToggleLike?.(product.id)}
            className={cn(
              'grid size-9 place-items-center rounded-full border',
              'bg-background/85 shadow-sm backdrop-blur-md transition',
              'hover:scale-105 hover:bg-background',
              product.liked && 'border-secondary/30 text-secondary'
            )}>
            <Heart className={cn('size-4', product.liked && 'fill-current')} />
          </button>
        </div>

        <div className="absolute inset-x-3 bottom-3 flex translate-y-3 gap-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Button
            type="button"
            variant="secondary"
            className="flex-1 gap-2 rounded-xl"
            onClick={() => onPreview?.(product)}>
            <Eye className="size-4" />
            Preview
          </Button>

          <Button
            type="button"
            size="icon"
            className="rounded-xl"
            disabled={outOfStock}
            onClick={() => onAddToCart?.(product, selectedVariant)}>
            <ShoppingBag className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.category}
          </p>

          <h3 className="mt-1 line-clamp-2 font-semibold leading-snug">{product.name}</h3>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />

          <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>

          <span>({product.reviews})</span>
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {product.shortDescription}
        </p>

        <div className="mt-auto space-y-3">
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

          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-lg font-bold">₦{selectedVariant.price.toLocaleString()}</p>

              <p className={cn('text-[0.68rem]', outOfStock ? 'text-destructive' : 'text-muted-foreground')}>
                {outOfStock ? 'Out of stock' : `${selectedVariant.stockLeft} available`}
              </p>
            </div>

            <Button
              type="button"
              size="sm"
              className="rounded-full"
              disabled={outOfStock}
              onClick={() => onAddToCart?.(product, selectedVariant)}>
              Add
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
