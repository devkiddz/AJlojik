import Image from 'next/image';

import {
  ShoppingBag
} from 'lucide-react';

import {
  cn
} from '@/lib/utils';

import type {
  CommerceProduct
} from '../contracts/customerDashboardTypes';

type DashboardProductAvatarStackProps = {
  products: CommerceProduct[];

  limit?: number;

  size?: 'sm' | 'md';
};

export function DashboardProductAvatarStack({
  products,
  limit = 3,
  size = 'md'
}: DashboardProductAvatarStackProps) {
  const visibleProducts =
    products.slice(0, limit);

  const remaining =
    Math.max(
      products.length -
        visibleProducts.length,
      0
    );

  const sizeClassName =
    size === 'sm'
      ? 'size-8'
      : 'size-10';

  return (
    <div
      className="flex -space-x-2.5"
      aria-label={`${products.length} products`}>
      {visibleProducts.map(
        product => (
          <span
            key={product.id}
            title={product.name}
            className={cn(
              'relative grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-card bg-muted shadow-sm',
              sizeClassName
            )}>
            {product.image ? (
              <Image
                src={product.image}
                alt=""
                fill
                sizes={
                  size === 'sm'
                    ? '32px'
                    : '40px'
                }
                className="object-cover"
              />
            ) : (
              <ShoppingBag className="size-3.5 text-muted-foreground" />
            )}
          </span>
        )
      )}

      {remaining > 0 ? (
        <span
          className={cn(
            'relative grid shrink-0 place-items-center rounded-full border-2 border-card bg-muted text-xs font-semibold text-muted-foreground shadow-sm',
            sizeClassName
          )}>
          +{remaining}
        </span>
      ) : null}
    </div>
  );
}
