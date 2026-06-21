'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductType } from '@/types';
import { ChartColumnStacked, Eye, Form } from 'lucide-react';
import LikedComponent from '@/components/shared/LikedComponent';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Props = {
  product: ProductType;
  onSelect?: () => void; // Main card fallback click
  onPreview?: () => void; // Dedicated preview button function
  onToggleLike?: () => void;
};

export default function ProductCard({ product, onSelect, onPreview, onToggleLike }: Props) {
  //const variant = product.variants[0];
  const router = useRouter();
  const [selectedVariantId, setSelectedVariantId] = useState<string>(product.variants[0]?.id ?? '');

  const activeVariant =
    product.variants.find(variant => variant.id === selectedVariantId) ?? product.variants[0];

  return (
    <article className="group flex flex-col gap-2 mt-5 w-md md:max-w-2xl ">
      <div className="flex items-center gap-2">
        <Form className="w-4 h-4 md:w-5 md:h-5" />
        <h1 className="text-md md:text-2xl">Picked for you</h1>
      </div>
      <div className="grid grid-cols-5 justify-between items-center px-2 w-full md:min-h-75 group overflow-hidden rounded-md transition-all bg-card/50 hover:bg-card">
        {/* FEATURED PRODUCT IMAGE */}

        <div className="col-span-2 relative aspect-square md:aspect-16/16">
          <Image src={activeVariant.image} alt={product.name} fill className="object-cover rounded-md" />
        </div>

        {/* FEATURED PRODUCT CONTENTS */}
        {/* CONTENT DETAILS */}
        <div className="p-4 items-center justify-center col-span-3">
          <h3 className="line-clamp-1 text-md md:text-2xl font-semibold">{product.name}</h3>
          <p className="mt-2 line-clamp-2 text-xs md:text-sm text-muted-foreground">
            {product.shortDescription}
          </p>

          {/* category + PREVIEW */}
          <div className="mt-3 flex items-cent gap-4">
            <span className="flex items-center gap-1 text-xs md:text-sm text-primary">
              <ChartColumnStacked className="h-3 w-3 md:h-5 md:w-5 text-rose-500" />
              {product.category}
            </span>

            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                // Running the explicit preview-specific action instead of cascading onSelect
                if (onPreview) {
                  onPreview();
                } else if (onSelect) {
                  onSelect();
                }
              }}
              className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs md:text-sm transition hover:bg-muted cursor-pointer">
              Preview
              <Eye className="h-3 w-3 md:h-5 md:w-5" />
            </button>
          </div>

          {/* SIZE + PRICE */}
          <div className="mt-4 flex items-end justify-between gap-4">
            {/* Prevent clicks inside this interactive area from bubbling out to the card container */}
            <div className="flex flex-col items-start gap-2 w-full" onClick={e => e.stopPropagation()}>
              <div className="flex gap-2">
                <span className="text-xs text-muted-foreground">Size</span>
                <span className="text-xs text-muted-foreground">{activeVariant.stockLeft} left</span>
              </div>

              <div className="flex items-center w-full gap-4">
                <Select
                  value={selectedVariantId}
                  onValueChange={value => {
                    if (value) setSelectedVariantId(value);
                  }}>
                  {/* Intercept the trigger click to preserve state focus rules */}
                  <SelectTrigger className="h-8 w-[120px]" onClick={e => e.stopPropagation()}>
                    <SelectValue placeholder="Select Size" />
                  </SelectTrigger>

                  {/* Intercept dropdown option clicks targeting the root React Portal */}
                  <SelectContent onClick={e => e.stopPropagation()}>
                    {product.variants.map(variant => (
                      <SelectItem key={variant.id} value={variant.id}>
                        {variant.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center justify-end shrink-0">
                  <span className="text-sm font-bold text-rose-500">
                    ₦{activeVariant.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
