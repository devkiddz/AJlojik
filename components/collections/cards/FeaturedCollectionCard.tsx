'use client';

import Image from 'next/image';
import { Eye, ShoppingCart, Package2, ChevronDown } from 'lucide-react';

import { ProductType } from '@/types';
import { Button } from '@/components/ui/button';

type Props = {
  product: ProductType;
  onSelect?: (id: string) => void;
};

export default function FeaturedCollectionCard({ product, onSelect }: Props) {
  const variant = product.variants[0];

  return (
    <article className="group h-[285px] overflow-hidden py-5 rounded-md border border-white/10 bg-card shadow-xl transition-all duration-500 hover:border-accent/30 hover:shadow-2xl">
      <div className="grid h-full grid-cols-[42%_58%]">
        {/* IMAGE */}
        <button
          aria-label="variant"
          type="button"
          onClick={() => onSelect?.(product.id)}
          className="relative overflow-hidden bg-black text-left">
          <Image
            src={variant.image}
            alt={product.name}
            fill
            sizes="320px"
            className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/25" />
        </button>

        {/* CONTENT */}
        <div className="flex h-full flex-col justify-between bg-[#0b1324] p-5">
          <div>
            <h3 className="line-clamp-1 text-2xl font-black leading-tight text-white">{product.name}</h3>

            <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/65">{product.shortDescription}</p>

            <div className="mt-4 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                <Package2 className="h-4 w-4 text-secondary" />
                {product.category}
              </span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onSelect?.(product.id)}
                className="h-8 rounded-full border-white/15 bg-white/5 px-4 text-white hover:bg-white/10">
                Preview
                <Eye className="ml-1.5 h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-white/80">In Stock</span>
              <span className="text-white/60">{variant.stockLeft} left</span>
            </div>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="flex h-10 w-36 items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-white">
              <span>{variant.label}</span>
              <ChevronDown className="h-4 w-4 text-white/55" />
            </div>

            <div className="flex items-center gap-3">
              <p className="text-lg font-black text-secondary">₦{variant.price.toLocaleString()}</p>

              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-10 w-10 rounded-full border-white/10 bg-white/5 text-white hover:bg-secondary hover:text-white">
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
