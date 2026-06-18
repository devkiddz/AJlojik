'use client';

import { ProductType } from '@/types';
import Image from 'next/image';
import RatingComponent from './RatingComponent';

type PreviewPanelProps = {
  product: ProductType | null;
};

export default function PreviewPanel({ product }: PreviewPanelProps) {
  const activeVariant = product?.variants?.[0];
  return (
    <div className="w-[380px] border-l bg-background h-full p-4">
      {!product ? (
        <div className="text-sm text-muted-foreground">Select a product to preview</div>
      ) : (
        <div className="space-y-4">
          {/* IMAGE / VIDEO */}
          <div className="rounded-xl overflow-hidden bg-muted h-44 relative">
            {activeVariant?.image && (
              <Image src={activeVariant.image} alt={product.name} fill className="object-cover" />
            )}
          </div>

          {/* TITLE */}
          <div>
            <h2 className="text-lg font-semibold">{product.name}</h2>

            <p className="text-sm text-muted-foreground mt-1">{product.shortDescription}</p>
          </div>

          {/* CATEGORY */}
          <div className="text-xs text-primary">{product.category}</div>

          {/* RATING */}
          <RatingComponent rating={product.rating} reviews={product.reviews} />

          {/* PRICE */}
          <div className="text-lg font-bold text-rose-500">₦{activeVariant?.price ?? 0}</div>

          {/* ACTIONS */}
          <div className="flex gap-2 pt-2">
            <button className="flex-1 px-3 py-2 rounded-full bg-primary text-primary-foreground text-sm">
              View Details
            </button>

            <button className="px-3 py-2 rounded-full border text-sm">Add Item</button>
          </div>
        </div>
      )}
    </div>
  );
}
