'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { ArrowUpRight, Clock3, Tag } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { ProductActionTray } from './ProductActionTray';
import type { BaseProductCardProps } from './productCardTypes';
import { createProductPriceFormatter, openProductExperience } from './productCardPresentation';
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
  locale = 'en-NG',
  currency = 'NGN',
  onOpenExperience,
  onPreview,
  onAddToCart,
  onAskAI
}: PromoProductCardProps) {
  const { selectedVariant, selectedVariantId, setSelectedVariantId } = useProductVariant(product);

  const priceFormatter = useMemo(() => createProductPriceFormatter(locale, currency), [currency, locale]);

  if (!selectedVariant) {
    return null;
  }

  const originalPrice =
    product.discountPercentage > 0
      ? Math.round(Number(selectedVariant.price) / (1 - product.discountPercentage / 100))
      : null;

  const openExperience = (): void => {
    openProductExperience({
      product,
      onOpenExperience,
      onPreview
    });
  };

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

        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between p-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg backdrop-blur-md"
            style={{
              backgroundColor: accent ? `${accent}dd` : undefined,
              color: accent ? '#fff' : undefined
            }}>
            <Tag className="size-3.5" />
            {badge}
          </span>

          {product.discountPercentage > 0 ? (
            <span className="rounded-full bg-black/75 px-3 py-1.5 text-xs font-black text-white backdrop-blur-md">
              {product.discountPercentage}% OFF
            </span>
          ) : null}
        </div>

        <button
          type="button"
          aria-label={`Open ${product.name} offer`}
          onClick={openExperience}
          className="absolute inset-0 z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
          <span className="sr-only">Open {product.name} offer</span>
        </button>

        <button
          type="button"
          onClick={openExperience}
          className="absolute inset-x-3 bottom-3 z-30 hidden translate-y-3 items-center justify-center gap-2 rounded-xl bg-black/70 px-4 py-3 text-sm font-semibold text-white opacity-0 backdrop-blur-md transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 lg:flex">
          View offer
          <ArrowUpRight className="size-4" />
        </button>
      </div>

      <div className="space-y-4 p-4">
        <button
          type="button"
          onClick={openExperience}
          className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <h3 className="line-clamp-2 font-bold">{product.name}</h3>

          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {product.shortDescription}
          </p>
        </button>

        <div className="hidden lg:block">
          <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
            <SelectTrigger className="h-9 rounded-xl">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>

            <SelectContent>
              {product.variants.map(variant => (
                <SelectItem key={variant.id} value={String(variant.id)} disabled={variant.stockLeft <= 0}>
                  {variant.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            {originalPrice ? (
              <p className="text-xs text-muted-foreground line-through">
                {priceFormatter.format(originalPrice)}
              </p>
            ) : null}

            <p className="truncate text-xl font-black text-secondary">
              {priceFormatter.format(Number(selectedVariant.price))}
            </p>
          </div>

          <ProductActionTray
            product={product}
            variant={selectedVariant}
            onAddToCart={onAddToCart}
            onAskAI={onAskAI}
            presentation="inline"
            compact
            showAddLabel
          />
        </div>

        {endsAt ? (
          <div className="flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
            <Clock3 className="size-3.5" />
            Offer ends {new Date(endsAt).toLocaleDateString(locale)}
          </div>
        ) : null}
      </div>
    </article>
  );
}
