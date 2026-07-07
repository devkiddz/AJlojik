'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Eye, ShoppingCart, ChartColumnStacked } from 'lucide-react';

import { ProductType } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ProductVariant = ProductType['variants'][number];

type Props = {
  product: ProductType;
  onSelect?: (id: string) => void;
  onAddToCart?: (product: ProductType, variant: ProductVariant) => void;
};

export default function FeaturedCollectionCard({ product, onSelect, onAddToCart }: Props) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(product.variants[0]?.id ?? null);

  const activeVariant = useMemo(() => {
    return product.variants.find(variant => variant.id === selectedVariantId) ?? product.variants[0];
  }, [product.variants, selectedVariantId]);

  if (!activeVariant) return null;

  return (
    <article className="group flex w-full flex-col overflow-hidden rounded-md border border-muted bg-card shadow-md transition-all hover:shadow-xl">
      <div className="grid grid-cols-5 bg-card/50">
        {/* IMAGE */}
        <div
          role="button"
          onClick={() => onSelect?.(product.id)}
          className="relative col-span-2 h-55 lg:h-69 overflow-hidden cursor-pointer">
          <Image
            src={activeVariant.image}
            alt={product.name}
            fill
            sizes="(max-width:768px) 40vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/25" />
        </div>

        {/* CONTENT */}
        <div className="col-span-3 flex flex-col justify-between p-3 md:p-4">
          <div className="space-y-1">
            <h3 className="line-clamp-1 pr-2 text-xs font-semibold md:text-2xl">{product.name}</h3>
            <p className="line-clamp-2 text-[10px] text-muted-foreground md:text-sm">
              {product.shortDescription}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="flex items-center gap-1 text-[10px] text-primary md:text-sm">
                <ChartColumnStacked className="h-3 w-3 text-rose-500" />
                {product.category}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelect?.(product.id)}
                className="h-6 gap-1 rounded-full px-2 text-[10px] md:h-8">
                Preview <Eye className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {/* STOCK + PRICE */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{activeVariant.stockLeft} in stock</span>
              <span className="font-bold text-rose-500 md:text-sm">
                ₦{activeVariant.price.toLocaleString()}
              </span>
            </div>

            {/* VARIANT SELECT + CART */}
            <div className="flex items-center justify-between gap-2" onClick={e => e.stopPropagation()}>
              <Select value={selectedVariantId || ''} onValueChange={setSelectedVariantId}>
                <SelectTrigger className="h-8 w-[120px] text-xs">
                  <SelectValue placeholder="Option" />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full border-muted-foreground/20"
                onClick={() => onAddToCart?.(product, activeVariant)}>
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
