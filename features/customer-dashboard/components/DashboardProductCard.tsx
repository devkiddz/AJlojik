import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowUpRight,
  Sparkles,
  Star
} from 'lucide-react';

import type {
  CommerceProduct
} from '../contracts/customerDashboardTypes';

const currencyFormatter =
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  });

type DashboardProductCardProps = {
  product: CommerceProduct;
};

export function DashboardProductCard({
  product
}: DashboardProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group w-40 shrink-0 snap-start sm:w-44 lg:w-48">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border/50 bg-muted shadow-sm">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="192px"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center">
            <Sparkles className="size-6 text-muted-foreground" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          {product.isNew ? (
            <span className="rounded-lg bg-white/90 px-2 py-1 text-[11px] font-semibold text-black">
              New
            </span>
          ) : null}

          {!product.isNew &&
          product.featured ? (
            <span className="rounded-lg bg-amber-100/90 px-2 py-1 text-[11px] font-semibold text-amber-950">
              Featured
            </span>
          ) : null}
        </div>

        <span className="absolute bottom-2.5 left-2.5 rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-black shadow-sm">
          {currencyFormatter.format(
            product.price
          )}
        </span>

        <span className="absolute bottom-2.5 right-2.5 grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg transition group-hover:-translate-y-0.5">
          <ArrowUpRight className="size-4" />
        </span>
      </div>

      <p className="mt-2.5 truncate text-sm font-semibold">
        {product.name}
      </p>

      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="truncate text-xs capitalize text-muted-foreground">
          {product.categorySlug.replaceAll(
            '-',
            ' '
          )}
        </p>

        <span className="flex shrink-0 items-center gap-1 text-xs font-medium">
          <Star className="size-3.5 fill-current text-amber-500" />
          {product.rating.toFixed(1)}
        </span>
      </div>
    </Link>
  );
}
