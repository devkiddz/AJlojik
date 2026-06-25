'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ChartColumnStacked, Eye, Form, ShoppingCart } from 'lucide-react';

import { ProductType } from '@/types';
import { categories } from '@/categories';

import LikedComponent from '@/components/shared/LikedComponent';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Button } from '../ui/button';

type Props = {
  product: ProductType;
  onSelect?: () => void;
  onPreview?: () => void;
  onToggleLike?: () => void;
};

export default function ProductCard({ product, onSelect, onPreview, onToggleLike }: Props) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? '');

  const activeVariant =
    product.variants.find(variant => variant.id === selectedVariantId) ?? product.variants[0];

  const categoryLabel =
    categories.find(category => category.slug === product.category)?.label ?? product.category;

  return (
    <article className="group mt-5 flex w-full flex-col gap-2 ">
      {/* HEADER */}
      <div className="flex items-center gap-2">
        <Form className="h-4 w-4 md:h-5 md:w-5" />
        <h2 className="text-md md:text-2xl">Picked for you</h2>
      </div>

      {/* CARD */}
      <div className="py-7 rounded-md bg-card mt-2 transition-all overflow-hidden">
        <div className="grid grid-cols-5 overflow-hidden bg-card/50 transition-colors ">
          {/* IMAGE */}
          <div className="relative col-span-2 min-h-[150px] overflow-hidden">
            <Image
              src={activeVariant.image}
              alt={product.name}
              fill
              sizes="(max-width:768px) 40vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />

            <div className="absolute left-2 top-2 z-10" onClick={e => e.stopPropagation()}>
              <LikedComponent productId={product.id} liked={product.liked} onToggle={onToggleLike} />
            </div>
          </div>

          {/* CONTENT */}
          <div className="col-span-3 flex flex-col justify-between p-3 md:p-4">
            {/* TOP */}
            <div>
              <h3 className="line-clamp-1 pr-2 text-xs font-semibold md:text-2xl">{product.name}</h3>

              <p className="mt-1 line-clamp-2 text-[10px] text-muted-foreground md:mt-2 md:text-sm">
                {product.shortDescription}
              </p>

              <div className="mt-2 flex items-center gap-3 md:mt-3">
                <span className="flex items-center gap-1 text-[10px] text-primary md:text-sm">
                  <ChartColumnStacked className="h-3 w-3 text-secondary md:h-4 md:w-4" />
                  {categoryLabel}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();

                    if (onPreview) {
                      onPreview();
                    } else {
                      onSelect?.();
                    }
                  }}
                  className="h-6 gap-1 rounded-full px-3 text-[10px] md:h-8 md:text-sm">
                  Preview
                  <Eye className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            </div>

            {/* BOTTOM */}
            <div className="mt-3 flex flex-col gap-3" onClick={e => e.stopPropagation()}>
              {/* STOCK + PRICE */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>In Stock</span>
                  <span>{activeVariant.stockLeft} left</span>
                </div>

                <span className="text-xs font-bold text-secondary md:text-sm">
                  ₦{activeVariant.price.toLocaleString()}
                </span>
              </div>

              {/* VARIANT + CART */}
              <div className="flex items-center justify-between gap-2">
                <Select
                  value={selectedVariantId}
                  onValueChange={value => {
                    if (value) {
                      setSelectedVariantId(value);
                    }
                  }}>
                  <SelectTrigger className="h-8 w-[120px] text-xs md:text-sm">
                    <SelectValue placeholder="Choose Option" />
                  </SelectTrigger>

                  <SelectContent>
                    {product.variants.map(variant => (
                      <SelectItem key={variant.id} value={variant.id}>
                        {variant.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon" className="rounded-full">
                  <ShoppingCart />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
