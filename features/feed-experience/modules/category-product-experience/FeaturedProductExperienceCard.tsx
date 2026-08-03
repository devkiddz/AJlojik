'use client';

import Image from 'next/image';

import { Eye, Star } from 'lucide-react';

import { useMemo } from 'react';

import { Button } from '@/components/ui/button';

import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

import type { FeedActions } from '@/features/feed-experience/contracts';

import { ProductActionTray } from '@/features/products/cards';

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

  const openExperience = (): void => {
    actions.openExperience({
      type: 'product',
      productId: product.id
    });
  };

  console.count('FeaturedProductExperienceCard render');

  return (
    <article className="grid h-full min-h-[17rem] w-full min-w-0 grid-cols-[minmax(9rem,0.9fr)_minmax(0,1.1fr)] overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition duration-300 hover:border-primary/20 hover:shadow-xl lg:w-[34rem] lg:min-w-[34rem] lg:max-w-[34rem]">
      <div className="relative min-h-52 overflow-hidden bg-muted sm:min-h-full">
        <Image
          src={selectedVariant.image}
          alt={product.name}
          fill
          priority
          sizes="(max-width: 640px) 100vw, 28vw"
          className="object-cover transition duration-700 hover:scale-[1.025]"
        />

        <button
          type="button"
          onClick={openExperience}
          aria-label={`Open ${product.name}`}
          className="absolute inset-0 z-10"
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/5"
        />

        <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-wrap gap-1.5">
          {product.discountPercentage > 0 ? (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[9px] font-black text-secondary-foreground shadow-md">
              -{product.discountPercentage}%
            </span>
          ) : null}

          {product.isNew ? (
            <span className="rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[9px] font-bold text-white backdrop-blur-md">
              New
            </span>
          ) : null}
        </div>

        <p className="pointer-events-none absolute inset-x-4 bottom-4 z-20 truncate text-[9px] font-bold uppercase tracking-[0.18em] text-white/75">
          {product.category.replaceAll('-', ' ')}
        </p>
      </div>

      <div className="flex min-w-0 flex-col p-4 sm:p-5">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-primary">Featured product</p>

          <button type="button" onClick={openExperience} className="mt-1 block min-w-0 text-left">
            <h3 className="line-clamp-2 text-lg font-semibold leading-tight tracking-tight sm:text-xl">
              {title ?? product.name}
            </h3>
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />

          <span className="font-bold text-foreground">{product.rating.toFixed(1)}</span>

          <span>({product.reviews})</span>

          <span className="mx-1 size-1 rounded-full bg-border" />

          <span>{product.soldCount} sold</span>
        </div>

        <p className="mt-3 line-clamp-2 text-[11px] leading-5 text-muted-foreground">
          {product.shortDescription}
        </p>

        <div className="mt-auto space-y-3 pt-4">
          <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
            <SelectTrigger
              aria-label={`Select a variant for ${product.name}`}
              className="h-9 w-full rounded-xl text-[10px]">
              <span data-slot="select-value" className="flex min-w-0 flex-1 items-center truncate text-left">
                {selectedVariant.label}
              </span>
            </SelectTrigger>

            <SelectContent align="start">
              {product.variants.map(variant => (
                <SelectItem key={variant.id} value={String(variant.id)}>
                  {variant.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-black">
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
              variant="outline"
              size="sm"
              onClick={() => actions.previewProduct(product)}
              className="h-9 shrink-0 rounded-full px-3 text-[10px]">
              <Eye className="size-3.5" />
              Details
            </Button>
          </div>

          <ProductActionTray
            product={product}
            variant={selectedVariant}
            onAddToCart={actions.addToCart}
            presentation="inline"
            cartLabelOnly
            compactCart
            className="w-full flex-nowrap justify-start rounded-2xl bg-background/55 p-1.5"
          />
        </div>
      </div>
    </article>
  );
}
