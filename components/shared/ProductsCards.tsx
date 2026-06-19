'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChartColumnStacked, Eye } from 'lucide-react';

import { ProductType } from '@/types';

import LikedComponent from './LikedComponent';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ProductCardProps = {
  product: ProductType;
  variant?: 'home' | 'store';
  onSelect?: () => void;
  onToggleLike?: () => void;
};

export default function ProductCard({ product, variant = 'home', onSelect, onToggleLike }: ProductCardProps) {
  const router = useRouter();

  const [selectedVariantId, setSelectedVariantId] = useState<string>(product.variants[0]?.id ?? '');

  const activeVariant =
    product.variants.find(variant => variant.id === selectedVariantId) ?? product.variants[0];

  const handleCardClick = () => {
    if (onSelect) {
      onSelect();
      return;
    }

    router.push(`/products/${product.slug}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className="group cursor-pointer rounded-xl border bg-background p-2 transition-all hover:shadow-md">
      {/* IMAGE */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <Image
          src={activeVariant.image}
          alt={product.name}
          fill
          sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />

        <div className="relative z-30 flex flex-col" onClick={e => e.stopPropagation()}>
          <span className="absolute top-3">
            <LikedComponent productId={product.id} liked={product.liked} onToggle={onToggleLike} />
          </span>

          {/* DISCOUNT BADGE */}
          {product.discountPercentage > 0 && (
            <span className="top-6 absolute right-1 rounded-full border-b bg-rose-500/80 px-2 py-1 text-xs font-medium text-white">
              -{product.discountPercentage}% off
            </span>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-3">
        {/* STORE VARIANT */}
        {variant === 'store' && (
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={e => {
                e.stopPropagation();
                onSelect?.();
              }}
              className="rounded-full bg-rose-500 px-3 py-1 text-xs text-white hover:bg-rose-600">
              Add to Cart
            </button>

            <button
              onClick={e => {
                e.stopPropagation();
                router.push(`/products/${product.slug}`);
              }}
              className="text-xs text-muted-foreground hover:text-rose-500">
              View
            </button>
          </div>
        )}
        {/* STORE VARIANT */}

        <h3 className="line-clamp-1 text-sm font-semibold">{product.name}</h3>

        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{product.shortDescription}</p>

        {/* CATEGORY + PREVIEW */}
        <div className="mt-3 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-primary">
            <ChartColumnStacked className="h-3 w-3 text-rose-500" />
            {product.category}
          </span>

          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onSelect?.();
            }}
            className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition hover:bg-muted">
            Preview
            <Eye className="h-3 w-3" />
          </button>
        </div>

        {/* SIZE + PRICE */}
        <div className="mt-4 flex items-end justify-between gap-4">
          <div className="flex flex-col items-start gap-2" onClick={e => e.stopPropagation()}>
            <div className="flex gap-2">
              <span className="text-xs text-muted-foreground">Size</span>
              <span className="text-xs text-muted-foreground">{activeVariant.stockLeft} left</span>
            </div>

            <div className="flex items-center justify-between gap-8">
              <Select
                value={selectedVariantId}
                onValueChange={value => {
                  if (value) {
                    setSelectedVariantId(value);
                  }
                }}>
                <SelectTrigger className="h-8 w-[120px]">
                  <SelectValue placeholder="Select Size" />
                </SelectTrigger>

                <SelectContent>
                  {product.variants.map(variant => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center justify-end">
                <span className="text-md font-bold text-rose-500">
                  ₦{activeVariant.price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
