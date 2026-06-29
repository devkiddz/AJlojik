'use client';

import { ProductVariant } from '@/types';

type Props = {
  variant: ProductVariant;
  inStock: boolean;
};

export default function SingleProductPurchaseCard({ variant, inStock }: Props) {
  return (
    <div className="rounded-3xl border bg-card p-6">
      <div className="text-4xl font-black">₦{variant.price.toLocaleString()}</div>

      <div className="mt-2 text-sm text-muted-foreground">{variant.stockLeft} left</div>

      <button
        disabled={!inStock}
        className="mt-6 w-full rounded-xl bg-primary py-3 text-primary-foreground disabled:opacity-50">
        Add to Cart
      </button>
    </div>
  );
}
