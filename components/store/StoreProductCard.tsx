'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChartColumnStacked, Eye } from 'lucide-react';

import { ProductType } from '@/types';
import LikedComponent from '@/components/shared/LikedComponent';

type ProductCardProps = {
  product: ProductType;
  onSelect?: () => void; // Main card fallback click
  onPreview?: () => void; // Dedicated preview button function
  onToggleLike?: () => void;
};

export default function ProductCard({ product, onSelect, onPreview, onToggleLike }: ProductCardProps) {
  const router = useRouter();
  const [selectedVariantId, setSelectedVariantId] = useState<string>(product.variants[0]?.id ?? '');

  const activeVariant =
    product.variants.find(variant => variant.id === selectedVariantId) ?? product.variants[0];

  const handleCardClick = () => {
    // Execute optional callback if it exists (without returning early)
    // Always navigate to the single product page
    router.push(`/products/${product.slug}`);
  };

  return (
    <article
      onClick={handleCardClick}
      //  group overflow-hidden rounded-md transition-all bg-card/50 hover:bg-card
      className="group cursor-pointer rounded-md bg-background transition-all hover:shadow-md">
      {/* IMAGE CONTAINER */}
      <div className="relative aspect-2/1.5 md:aspect-5/4 overflow-hidden rounded-lg bg-muted ">
        <Image
          src={activeVariant.image}
          alt={product.name}
          fill
          sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />

        <div className="relative flex flex-col" onClick={e => e.stopPropagation()}>
          <span className="absolute top-3 z-30">
            <LikedComponent productId={product.id} liked={product.liked} onToggle={onToggleLike} />
          </span>
          {product.discountPercentage > 0 && (
            <span className="top-5 absolute right-1 rounded-full border-b bg-rose-500/90 px-2 py-1 text-xs font-medium text-white shadow-sm">
              -{product.discountPercentage}% off
            </span>
          )}
        </div>
      </div>

      {/* CONTENT DETAILS */}
      <div className="p-3">
        <h3 className="line-clamp-1 text-xs md:text-sm font-semibold">{product.name}</h3>
        <p className="mt-2 line-clamp-2 pr-2 text-xs text-muted-foreground">{product.shortDescription}</p>

        {/* category + PREVIEW */}
        <div className="mt-3 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-primary">
            <ChartColumnStacked className="h-3 w-3 text-rose-500" />
            {product.category}
          </span>
          <div className="flex items-center justify-end shrink-0">
            <span className="text-sm font-bold text-rose-500">₦{activeVariant.price.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
