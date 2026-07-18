'use client';

import Image from 'next/image';

import { ArrowUpRight, Clock3, ShoppingBag, Tag } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { cn } from '@/lib/utils';

import type { BaseProductCardProps } from './productCardTypes';

import { useProductVariant } from './useProductVariant';

type PromoProductCardProps = BaseProductCardProps & {
  badge?: string;
  accent?: string;
  endsAt?: string | Date | null;
};

export function PromoProductCard({
  product,
  badge = 'Special offer',
  accent,
  endsAt,
  className,
  onPreview,
  onAddToCart
}: PromoProductCardProps) {
  const { selectedVariant, selectedVariantId, setSelectedVariantId } = useProductVariant(product);

  if (!selectedVariant) return null;

  const originalPrice =
    product.discountPercentage > 0
      ? Math.round(selectedVariant.price / (1 - product.discountPercentage / 100))
      : null;

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-2xl border bg-card',
        'shadow-sm transition duration-300',
        'hover:-translate-y-1 hover:shadow-xl',
        className
      )}
      style={{
        borderColor: accent ? `${accent}45` : undefined
      }}>
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={selectedVariant.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg backdrop-blur-md"
            style={{
              backgroundColor: accent ? `${accent}dd` : undefined,
              color: accent ? '#fff' : undefined
            }}>
            <Tag className="size-3.5" />
            {badge}
          </span>

          {product.discountPercentage > 0 && (
            <span className="rounded-full bg-black/75 px-3 py-1.5 text-xs font-black text-white backdrop-blur-md">
              {product.discountPercentage}% OFF
            </span>
          )}
        </div>

        <button
          type="button"
          aria-label="Preview promotion product"
          onClick={() => onPreview?.(product)}
          className="absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-center gap-2 rounded-xl bg-black/70 px-4 py-3 text-sm font-semibold text-white opacity-0 backdrop-blur-md transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View offer
          <ArrowUpRight className="size-4" />
        </button>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <h3 className="line-clamp-2 font-bold">{product.name}</h3>

          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {product.shortDescription}
          </p>
        </div>

        <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
          <SelectTrigger className="h-9 rounded-xl">
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

        <div className="flex items-end justify-between gap-3">
          <div>
            {originalPrice && (
              <p className="text-xs text-muted-foreground line-through">₦{originalPrice.toLocaleString()}</p>
            )}

            <p className="text-xl font-black text-secondary">₦{selectedVariant.price.toLocaleString()}</p>
          </div>

          <Button
            type="button"
            size="sm"
            className="gap-2 rounded-full"
            disabled={selectedVariant.stockLeft <= 0}
            onClick={() => onAddToCart?.(product, selectedVariant)}>
            <ShoppingBag className="size-4" />
            Add
          </Button>
        </div>

        {endsAt && (
          <div className="flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
            <Clock3 className="size-3.5" />
            Offer ends {new Date(endsAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </article>
  );
}
