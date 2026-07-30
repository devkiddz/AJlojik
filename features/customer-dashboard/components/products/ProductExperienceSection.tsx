'use client';

import Link from 'next/link';

import type {
  ReactNode
} from 'react';

import {
  ArrowUpRight
} from 'lucide-react';

import type {
  CommerceProduct
} from '../../contracts/customerDashboardTypes';

import {
  DashboardRail
} from '../rail/DashboardRail';

import {
  DashboardProductPreview,
  type DashboardProductSource
} from './DashboardProductPreview';

type ProductExperienceSectionProps = {
  code: string;
  title: string;
  icon: ReactNode;

  products: CommerceProduct[];

  href: string;
  source: DashboardProductSource;
};

export function ProductExperienceSection({
  code,
  title,
  icon,
  products,
  href,
  source
}: ProductExperienceSectionProps) {
  return (
    <DashboardRail
      title={title}
      code={`${code} · ${products.length}`}
      icon={icon}>
      {products.length > 0 ? (
        products.map(
          (
            product,
            index
          ) => (
            <DashboardProductPreview
              key={product.id}
              product={product}
              position={index + 1}
              source={source}
            />
          )
        )
      ) : (
        <EmptyProductShelf
          href={href}
        />
      )}

      {products.length > 0 ? (
        <Link
          data-rail-item
          href={href}
          aria-label={`View all ${title}`}
          className="
            group grid min-h-60
            w-36 shrink-0 snap-start
            place-items-center
            rounded-xl border
            border-dashed
            border-border/70
            bg-muted/20 p-3
            text-center transition
            hover:border-primary/30
            hover:bg-muted/40
            sm:w-40
            lg:w-44
          ">
          <span>
            <span
              className="
                mx-auto grid size-9
                place-items-center
                rounded-lg bg-background
                text-foreground shadow-sm
                transition
                group-hover:-translate-y-0.5
              ">
              <ArrowUpRight className="size-4" />
            </span>

            <span
              className="
                mt-2.5 block
                text-xs font-semibold
              ">
              View all
            </span>

            <span
              className="
                mt-1 block text-[11px]
                text-muted-foreground
              ">
              {products.length} products
            </span>
          </span>
        </Link>
      ) : null}
    </DashboardRail>
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
      className="
        group grid min-h-60
        w-[78vw] max-w-64
        shrink-0 snap-start
        place-items-center
        rounded-xl border
        border-dashed
        border-border/70
        bg-muted/20 p-4
        text-center transition
        hover:border-primary/30
        hover:bg-muted/40
        sm:w-64
      ">
      <span>
        <span className="block text-2xl font-bold">
          0
        </span>

        <span
          className="
            mt-1 block text-xs
            text-muted-foreground
          ">
          No products selected yet
        </span>

        <span
          className="
            mx-auto mt-3
            inline-flex items-center
            gap-1.5 rounded-lg
            bg-foreground
            px-3 py-2
            text-xs font-semibold
            text-background
          ">
          Explore products

          <ArrowUpRight className="size-3.5" />
        </span>
      </span>
    </Link>
  );
}
