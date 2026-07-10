'use client';

import Image from 'next/image';
import { ProductType, ProductVariantType } from '@/types';
import { categories } from '@/data/categories';
import { categoryType } from '@/types';

const FALLBACK_COVER = '/images/brand-backdrop.jpg';

type Props = {
  product: ProductType;
  activeVariant: ProductVariantType | null;
};

export default function ProductHeroSection({ product, activeVariant }: Props) {
  const category = categories.find(item => item.slug === product.category) as categoryType | undefined;
  const displayImage = activeVariant?.image ?? product.variants[0]?.image ?? '/placeholder.jpg';
  const coverImage = category?.coverImages?.[0] ?? category?.image ?? FALLBACK_COVER;

  return (
    <section className="relative w-full overflow-hidden bg-background border-b border-border">
      {/* Background stays subtle */}
      <div className="absolute inset-0 z-0 opacity-30">
        <Image src={coverImage} alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 md:py-20">
        <div className="flex items-center gap-6">
          {/* Tile-feel: smaller on mobile, scales up */}
          <div className="relative h-20 w-20 md:h-32 md:w-32 shrink-0 rounded-2xl border border-border bg-card p-1 shadow-xl">
            <Image src={displayImage} alt={product.name} fill className="object-cover rounded-xl" />
          </div>

          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter">{product.name}</h1>
            <p className="text-xs font-bold text-accent uppercase tracking-widest mt-1">
              {category?.label ?? 'Premium Selection'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
