'use client';

import Image from 'next/image';
import Link from 'next/link';

import { products } from '@/data/products';

export default function RecentlyViewedSidebar() {
  const recentProducts = products.slice(0, 4);

  return (
    <aside className="sticky top-24">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Recently Viewed
        </h3>

        <div className="space-y-3">
          {recentProducts.map(product => {
            const firstVariant = product.variants[0];

            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group flex items-center gap-3 rounded-xl border border-transparent p-2 transition hover:border-border hover:bg-muted/50">
                <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted">
                  <Image src={firstVariant?.image} alt={product.name} fill className="object-cover" />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-medium group-hover:text-primary">{product.name}</h4>

                  <p className="mt-1 text-xs text-muted-foreground">
                    ₦{firstVariant?.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
