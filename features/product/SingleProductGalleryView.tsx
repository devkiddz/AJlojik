'use client';

import Image from 'next/image';
import { ProductType } from '@/types/types';

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
      {/* PREVIEW CONTAINER MONITOR BOX BLOCK */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black/40 border border-white/[0.05] shadow-inner flex items-center justify-center">
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

      {/* CONFIGURATION SELECTOR TRACK HORIZONTAL WRAP */}
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
                  ? 'border-primary bg-background/10 text-white shadow-xs'
                  : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.05] hover:border-white/15'
              }`}>
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors ${isSelected ? 'bg-background animate-pulse' : 'bg-slate-500 group-hover:bg-slate-300'}`}
              />
              {variant.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
