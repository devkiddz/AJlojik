import { ImageIcon, PackageCheck, PackageX, TriangleAlert } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { StudioProductOption } from './studioTypes';

export function StudioProductSummary({
  products,
  className,
  compact = false
}: {
  products: StudioProductOption[];
  className?: string;
  compact?: boolean;
}) {
  const available = products.filter(product => product.available > 0 && product.active).length;
  const lowStock = products.filter(
    product => product.available > 0 && product.available <= 5 && product.active
  ).length;
  const unavailable = products.length - available;

  return (
    <div className={cn('rounded-2xl border border-border/60 bg-muted/25 p-3', className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black">
          {products.length} product{products.length === 1 ? '' : 's'}
        </p>
        <div className="flex -space-x-2">
          {products.slice(0, compact ? 3 : 5).map(product => (
            <span
              key={product.id}
              className="grid size-8 overflow-hidden rounded-xl border-2 border-background bg-muted"
              title={product.name}
            >
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <ImageIcon className="m-auto size-3.5 text-muted-foreground" />
              )}
            </span>
          ))}
          {products.length > (compact ? 3 : 5) ? (
            <span className="grid size-8 place-items-center rounded-xl border-2 border-background bg-foreground text-[8px] font-black text-background">
              +{products.length - (compact ? 3 : 5)}
            </span>
          ) : null}
        </div>
      </div>

      {!compact ? (
        <div className="mt-3 flex flex-wrap gap-2 text-[9px] font-bold">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-700 dark:text-emerald-300">
            <PackageCheck className="size-3" /> {available} available
          </span>
          {lowStock ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-amber-700 dark:text-amber-300">
              <TriangleAlert className="size-3" /> {lowStock} low stock
            </span>
          ) : null}
          {unavailable ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-destructive">
              <PackageX className="size-3" /> {unavailable} unavailable
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
