'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

import { openCustomerProductExperience } from '@/features/customer-experience';

type PublicShoppingListProductCardProps = {
  productId: string;
  productName: string;
  productDescription?: string | null;
  image: string;
  quantity: number;
  formattedPrice: string;
};

export function PublicShoppingListProductCard({
  productId,
  productName,
  productDescription,
  image,
  quantity,
  formattedPrice
}: PublicShoppingListProductCardProps) {
  return (
    <button
      type="button"
      onClick={() =>
        openCustomerProductExperience({
          id: productId,
          name: productName,
          shortDescription: productDescription
        })
      }
      aria-label={`Open ${productName} in Discovery Hub`}
      className="group overflow-hidden rounded-3xl border bg-card text-left transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={image}
          alt={productName}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-4">
        <h2 className="line-clamp-2 font-semibold">{productName}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Planned quantity: {quantity}</p>

        <div className="mt-4 flex items-end justify-between gap-3 border-t pt-3">
          <span className="font-bold">{formattedPrice}</span>
          <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
        </div>
      </div>
    </button>
  );
}
