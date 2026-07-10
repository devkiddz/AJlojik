'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, ShoppingCart } from 'lucide-react';

import { ProductType, ProductVariantType } from '@/types';

type Props = {
  product: ProductType;
  onPreview?: (product: ProductType) => void;
  onToggleLike?: (productId: string) => void;
  onAddToCart?: (product: ProductType, variant: ProductVariantType) => void;
};

export default function StoreProductGridCard({ product, onPreview, onAddToCart }: Props) {
  const cardRef = useRef<HTMLElement>(null);
  const variant = product.variants[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();

    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="premium-card group overflow-hidden rounded-2xl transition-all duration-500">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-xl">
          <Image
            src={variant.image}
            alt={product.name}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover transition-all duration-700 brightness-105 group-hover:scale-[1.06] group-hover:brightness-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90" />
        </div>
      </Link>

      <div className="space-y-2 p-3">
        <h3 className="line-clamp-1 text-xs font-semibold text-card-foreground md:text-sm">{product.name}</h3>

        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-accent">₦{variant.price.toLocaleString()}</span>

          <div className="flex items-center gap-1.5">
            {onPreview && (
              <button
                type="button"
                aria-label="Preview"
                onClick={e => {
                  e.preventDefault();
                  onPreview(product);
                }}
                className="
            flex h-8 w-8 items-center justify-center
            rounded-full
            border border-border/70
            bg-background/80
            backdrop-blur-md
            transition-all duration-300
            hover:scale-110
            hover:border-accent/40
            hover:bg-accent
            hover:text-accent-foreground
          ">
                <Eye className="h-4 w-4" />
              </button>
            )}

            <button
              type="button"
              aria-label="Add to cart"
              onClick={e => {
                e.preventDefault();
                onAddToCart?.(product, variant);
              }}
              className="
              flex h-8 w-8 items-center justify-center
              rounded-full
              bg-secondary
              text-white
              transition-all duration-300
              hover:scale-110
              hover:bg-secondary/90
            ">
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
