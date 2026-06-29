'use client';

import Image from 'next/image';
import { ProductType } from '@/types';

type Props = {
  product: ProductType;
  selectedVariantId: string;
  setSelectedVariantId: (id: string) => void;
};

export default function SingleProductGalleryView({
  product,
  selectedVariantId,
  setSelectedVariantId
}: Props) {
  const activeVariant = product.variants.find(v => v.id === selectedVariantId) ?? product.variants[0];
  const activeImage = activeVariant?.image ?? product.variants[0]?.image;

  return (
    <div className="w-full space-y-4">
      {/* PREVIEW CONTAINER STAGE */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted border border-border shadow-inner flex items-center justify-center">
        {activeImage && (
          <Image
            src={activeImage}
            alt={product.name}
            fill
            priority
            className="object-contain p-4 transition-all duration-300"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        )}
      </div>

      {/* REUSABLE VARIANT CONTAINER INTERFACES */}
      <div className="flex flex-wrap gap-2.5 pt-1">
        {product.variants.map(variant => {
          const isSelected = selectedVariantId === variant.id;
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => setSelectedVariantId(variant.id)}
              className={`group relative flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-bold tracking-tight transition-all active:scale-[0.98] ${
                isSelected
                  ? 'border-accent bg-accent/10 text-foreground shadow-xs'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}>
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors ${isSelected ? 'bg-accent animate-pulse' : 'bg-muted-foreground group-hover:bg-foreground'}`}
              />
              {variant.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
