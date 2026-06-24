'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';

import { ProductType } from '@/types';
import { categories } from '@/categories';

type Props = {
  product: ProductType;
};

export default function ProductHeroSection({ product }: Props) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const [isLiked, setIsLiked] = useState(product.liked);

  const category = categories.find(item => item.slug === product.category);

  const activeVariant = useMemo(() => {
    return product.variants.find(variant => variant.id === selectedVariantId) ?? product.variants[0] ?? null;
  }, [product, selectedVariantId]);

  // const activeImage = activeVariant?.image ?? product.variants[0]?.image;

  // const activePrice = activeVariant?.price ?? 0;

  // const activeStock = activeVariant?.stockLeft ?? 0;

  return (
    <section className="relative min-h-100">
      {/* COVER */}
      <div className="absolute inset-0">
        <Image
          src={category?.coverImages?.[0] ?? category?.image ?? '/placeholder.jpg'}
          alt={category?.label ?? ''}
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/75" />

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      </div>

      {/* CONTENT */}
    </section>
  );
}
