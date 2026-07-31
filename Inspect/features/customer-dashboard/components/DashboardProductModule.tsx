'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowRight,
  ArrowUpRight,
  ShoppingBag,
  Sparkles,
  Star
} from 'lucide-react';

import { openCustomerProductExperience } from '@/features/customer-experience';
import {
  cn
} from '@/lib/utils';

import type {
  CommerceMix,
  CommerceProduct
} from '../contracts/customerDashboardTypes';

import {
  DashboardProductAvatarStack
} from './DashboardProductAvatarStack';

const currencyFormatter =
  new Intl.NumberFormat(
    'en-NG',
    {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }
  );

type DashboardProductModuleVariant =
  | 'spotlight'
  | 'list'
  | 'compact';

type DashboardProductModuleProps = {
  mix: CommerceMix;
  variant?: DashboardProductModuleVariant;
};

function ProductRow({
  product
}: {
  product: CommerceProduct;
}) {
  return (
    <button
      type="button"
      onClick={() => openCustomerProductExperience({ id: product.id, name: product.name })}
      className="group/row flex w-full min-w-0 items-center text-left gap-3 rounded-xl border border-border/55 bg-background/70 p-2.5 transition hover:border-primary/25 hover:bg-muted/45">
      <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="48px"
            className="object-cover transition duration-500 group-hover/row:scale-105"
          />
        ) : (
          <span className="grid size-full place-items-center">
            <ShoppingBag className="size-4 text-muted-foreground" />
          </span>
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">
          {product.name}
        </span>

        <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate capitalize">
            {product.categorySlug.replaceAll(
              '-',
              ' '
            )}
          </span>

          <span className="flex shrink-0 items-center gap-1">
            <Star className="size-3 fill-current text-amber-500" />
            {product.rating.toFixed(1)}
          </span>
        </span>
      </span>

      <span className="shrink-0 text-xs font-semibold">
        {currencyFormatter.format(
          product.price
        )}
      </span>

      <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5" />
    </button>
  );
}

function SpotlightProduct({
  product
}: {
  product: CommerceProduct;
}) {
  return (
    <button
      type="button"
      onClick={() => openCustomerProductExperience({ id: product.id, name: product.name })}
      className="group/spotlight relative block min-h-40 w-full text-left overflow-hidden rounded-2xl border border-border/55 bg-slate-950 text-white">
      {product.image ? (
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 86vw, 560px"
          className="object-cover opacity-55 transition duration-700 group-hover/spotlight:scale-105"
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      <div className="relative flex min-h-40 flex-col justify-between p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-semibold backdrop-blur">
            {product.isNew
              ? 'New'
              : product.featured
                ? 'Featured'
                : 'Selected'}
          </span>

          <span className="grid size-9 place-items-center rounded-xl bg-white text-slate-950 transition group-hover/spotlight:-translate-y-0.5">
            <ArrowUpRight className="size-4" />
          </span>
        </div>

        <div>
          <p className="line-clamp-1 text-lg font-bold">
            {product.name}
          </p>

          <div className="mt-2 flex items-center gap-3 text-xs text-white/70">
            <span className="font-semibold text-white">
              {currencyFormatter.format(
                product.price
              )}
            </span>

            <span className="flex items-center gap-1">
              <Star className="size-3.5 fill-current text-amber-300" />
              {product.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export function DashboardProductModule({
  mix,
  variant = 'list'
}: DashboardProductModuleProps) {
  const featuredProduct =
    mix.products[0];

  const listProducts =
    variant === 'spotlight'
      ? mix.products.slice(1, 3)
      : mix.products.slice(
          0,
          variant === 'compact'
            ? 2
            : 3
        );

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm sm:p-5">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-primary">
            {mix.eyebrow}
          </p>

          <h3 className="mt-1 line-clamp-1 text-lg font-bold">
            {mix.title}
          </h3>

          <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
            {mix.description}
          </p>
        </div>

        <DashboardProductAvatarStack
          products={mix.products}
        />
      </header>

      <div className="mt-4">
        {variant === 'spotlight' &&
        featuredProduct ? (
          <SpotlightProduct
            product={featuredProduct}
          />
        ) : null}

        <div
          className={cn(
            'grid gap-2',
            variant === 'spotlight' &&
              'mt-2'
          )}>
          {listProducts.map(
            product => (
              <ProductRow
                key={product.id}
                product={product}
              />
            )
          )}
        </div>
      </div>

      <footer className="mt-4 flex items-center justify-between gap-3 border-t border-border/55 pt-3">
        <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 shrink-0 text-primary" />

          <span className="truncate">
            {mix.reason}
          </span>
        </p>

        <Link
          href={mix.href}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold transition hover:text-primary">
          View all
          <ArrowRight className="size-3.5" />
        </Link>
      </footer>
    </article>
  );
}
