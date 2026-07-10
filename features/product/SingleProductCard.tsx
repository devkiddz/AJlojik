'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ProductType } from '@/types';

export default function SingleProductCard({ product }: { product: ProductType }) {
  const [activeVariantId, setActiveVariantId] = useState(product.variants[0].id);
  const activeVariant = product.variants.find(v => v.id === activeVariantId) || product.variants[0];

  return (
    <div className="group premium-card p-4 rounded-3xl border border-white/[0.05] bg-white/[0.02] hover:border-accent/50 transition-all duration-300">
      {/* Main Image View */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black/20 mb-4">
        <Image
          src={activeVariant.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Variant Image Strip */}
      <div className="flex gap-2 mb-4">
        {product.variants.map(variant => (
          <button
            type="button"
            aria-label="variant"
            key={variant.id}
            onClick={() => setActiveVariantId(variant.id)}
            className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
              activeVariantId === variant.id ? 'border-primary' : 'border-transparent'
            }`}>
            <Image src={variant.image} alt={variant.label} width={40} height={40} className="object-cover" />
          </button>
        ))}
      </div>

      {/* Info Stack */}
      <div className="space-y-1">
        <h3 className="font-black text-sm truncate">{product.name}</h3>
        <p className="text-xs font-bold text-accent">₦{activeVariant.price.toLocaleString()}</p>
      </div>
    </div>
  );
}
