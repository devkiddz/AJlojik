import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowUpRight,
  ShoppingBag,
  Star
} from 'lucide-react';

import type {
  CommerceProduct
} from '../../contracts/customerDashboardTypes';
import { DashboardRail } from '../rail/DashboardRail';

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0
});

type ProductExperienceSectionProps = {
  code: string;
  title: string;
  icon: ReactNode;
  products: CommerceProduct[];
  href: string;
};

export function ProductExperienceSection({
  code,
  title,
  icon,
  products,
  href
}: ProductExperienceSectionProps) {
  return (
    <DashboardRail
      title={title}
      code={`${code} · ${products.length}`}
      icon={icon}>
      {products.length > 0 ? (
        products.map((product, index) => (
          <DashboardProductCard
            key={product.id}
            product={product}
            position={index + 1}
          />
        ))
      ) : (
        <EmptyProductShelf href={href} />
      )}

      {products.length > 0 ? (
        <Link
          data-rail-item
          href={href}
          className="grid min-h-64 w-40 shrink-0 snap-start place-items-center rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 text-center sm:w-44">
          <span>
            <span className="mx-auto grid size-10 place-items-center rounded-xl bg-background shadow-sm">
              <ArrowUpRight className="size-4" />
            </span>
            <span className="mt-3 block text-xs font-semibold">
              View all
            </span>
          </span>
        </Link>
      ) : null}
    </DashboardRail>
  );
}

function DashboardProductCard({
  product,
  position
}: {
  product: CommerceProduct;
  position: number;
}) {
  return (
    <Link
      data-rail-item
      href={`/products/${product.slug}`}
      className="group w-40 shrink-0 snap-start overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg sm:w-44">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="176px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center">
            <ShoppingBag className="size-5 text-muted-foreground" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />

        <span className="absolute left-2 top-2 rounded-lg bg-background/90 px-2 py-1 text-xs font-bold shadow-sm backdrop-blur">
          {String(position).padStart(2, '0')}
        </span>

        <span className="absolute right-2 top-2 grid size-8 place-items-center rounded-xl bg-background/90 shadow-sm backdrop-blur">
          <ArrowUpRight className="size-4" />
        </span>
      </div>

      <div className="p-3">
        <p className="line-clamp-2 break-words text-sm font-semibold leading-5">
          {product.name}
        </p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="min-w-0 break-words text-sm font-bold">
            {money.format(product.price)}
          </span>

          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground">
            <Star className="size-3 fill-current text-amber-500" />
            {product.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmptyProductShelf({
  href
}: {
  href: string;
}) {
  return (
    <Link
      data-rail-item
      href={href}
      className="grid min-h-64 w-[82vw] max-w-72 shrink-0 snap-start place-items-center rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 text-center sm:w-72">
      <span>
        <span className="block text-3xl font-bold">0</span>
        <span className="mt-1 block text-xs text-muted-foreground">
          Explore products
        </span>
      </span>
    </Link>
  );
}
