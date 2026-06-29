'use client';

import Image from 'next/image';
import { ProductType } from '@/types';

type Props = {
  product: ProductType;
  selectedVariantId: string;
  setSelectedVariantId: (id: string) => void;
};

export default function SingleProductGallery({ product, selectedVariantId, setSelectedVariantId }: Props) {
  const selected = product.variants.find(v => v.id === selectedVariantId) ?? product.variants[0];

  return (
    <section className="rounded-3xl border bg-card p-6">
      {/* Main Preview Image */}
      <div className="relative h-[450px] w-full overflow-hidden rounded-2xl bg-muted/50">
        <Image src={selected.image} alt={product.name} fill className="object-cover overflow-hidden" />
      </div>

      {/* Variant Selection Buttons (Labels) */}
      {/* <div className="mt-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {product.variants.map(variant => {
          const isSelected = variant.id === selectedVariantId;
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => setSelectedVariantId(variant.id)}
              className={`whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
              }`}>
              {variant.label}
            </button>
          );
        })}
      </div> */}
    </section>
  );
}
