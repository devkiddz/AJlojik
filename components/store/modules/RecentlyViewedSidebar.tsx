'use client';

import Image from 'next/image';
import Link from 'next/link';

import { products } from '@/data/products';

export default function RecentlyViewedSidebar() {
  const recentProducts = products.slice(0, 6);

  return (
    <aside className="lg:sticky lg:top-24">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Recently Viewed
        </h3>

        {/* MOBILE */}
        {/* MOBILE */}
        <div className="-mx-5 overflow-hidden lg:hidden">
          <div className="flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-hide">
            {recentProducts.map(product => {
              const firstVariant = product.variants[0];

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="w-[120px] shrink-0 rounded-xl border bg-background p-2">
                  <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-muted">
                    <Image src={firstVariant?.image} alt={product.name} fill className="object-cover" />
                  </div>

                  <h4 className="line-clamp-2 text-xs font-medium">{product.name}</h4>

                  <p className="mt-1 text-[11px] text-muted-foreground">
                    ₦{firstVariant?.price.toLocaleString()}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden space-y-3 lg:block">
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
