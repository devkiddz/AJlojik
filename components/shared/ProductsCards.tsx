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
  onSelect?: () => void;
  onToggleLike?: () => void;
};

export default function ProductCard({ product, onSelect, onToggleLike }: ProductCardProps) {
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

        <div className="absolute z-30 flex flex-col right-1 top-3" onClick={e => e.stopPropagation()}>
          <span className="">
            <LikedComponent productId={product.id} liked={product.liked} onToggle={onToggleLike} />
          </span>
          {product.discountPercentage > 0 && (
            <span className="top-5 relative right-40 rounded-full border-b bg-rose-500/50 px-2 py-1 text-xs font-medium text-primary">
              -{product.discountPercentage}% off
            </span>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-3">
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
