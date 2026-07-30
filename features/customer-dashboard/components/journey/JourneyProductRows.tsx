import Image from 'next/image';
import { PackageSearch } from 'lucide-react';

import type { CommerceProduct } from '../../contracts/customerDashboardTypes';

const money = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0
});

type JourneyProductRowsProps = {
  products: CommerceProduct[];
  emptyLabel: string;
  limit?: number;
};

export function JourneyProductRows({
  products,
  emptyLabel,
  limit = 4
}: JourneyProductRowsProps) {
  const visible = Array.from(new Map(products.map(product => [product.id, product])).values()).slice(
    0,
    limit
  );

  if (visible.length === 0) {
    return (
      <div className="grid h-full place-items-center rounded-xl border border-dashed border-border/60 bg-background/35 p-3 text-center">
        <div>
          <PackageSearch className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-2 text-xs font-medium text-muted-foreground">{emptyLabel}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-1.5 overflow-hidden">
      {visible.map(product => (
        <div
          key={product.id}
          className="flex min-h-0 flex-1 items-center gap-2.5 rounded-lg border border-border/50 bg-background/70 px-2 py-1.5">
          <span className="relative size-8 shrink-0 overflow-hidden rounded-lg border bg-muted">
            {product.image ? (
              <Image
                src={product.image}
                alt=""
                fill
                sizes="32px"
                className="object-cover"
              />
            ) : (
              <span className="grid size-full place-items-center">
                <PackageSearch className="size-3.5 text-muted-foreground" />
              </span>
            )}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold">{product.name}</span>
            <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
              {product.available ? money.format(product.price) : 'Currently unavailable'}
            </span>
          </span>

          <span className="shrink-0 text-[10px] font-bold text-muted-foreground">
            {product.stockLeft > 0 ? `${product.stockLeft} left` : 'View'}
          </span>
        </div>
      ))}
    </div>
  );
}
