'use client';

import Link from 'next/link';

import type { ReactNode } from 'react';

import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';

import type { CommerceProduct } from '../../contracts/customerDashboardTypes';

import { DashboardProductPreview, type DashboardProductSource } from './DashboardProductPreview';

type DashboardProductExperienceProps = {
  code: string;
  title: string;

  icon: ReactNode;

  products: CommerceProduct[];

  href: string;
  source: DashboardProductSource;
};

export function DashboardProductExperience({
  code,
  title,
  icon,
  products,
  href,
  source
}: DashboardProductExperienceProps) {
  const railId = `dashboard-products-${code.toLowerCase()}`;

  function scrollRail(direction: 'previous' | 'next'): void {
    const rail = document.getElementById(railId);

    if (!rail) {
      return;
    }

    const distance = Math.max(rail.clientWidth * 0.75, 320);

    rail.scrollBy({
      left: direction === 'next' ? distance : -distance,

      behavior: 'smooth'
    });
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary [&_svg]:size-4">
            {icon}
          </span>

          <div className="min-w-0">
            <h2 className="truncate text-base font-bold sm:text-lg">{title}</h2>

            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                {code}
              </span>

              <span className="text-xs font-semibold text-muted-foreground">{products.length}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            aria-label={`Previous ${title}`}
            onClick={() => scrollRail('previous')}
            className="grid size-8 place-items-center rounded-xl border border-border/60 bg-background text-muted-foreground transition hover:border-primary/25 hover:text-foreground">
            <ArrowLeft className="size-3.5" />
          </button>

          <button
            type="button"
            aria-label={`Next ${title}`}
            onClick={() => scrollRail('next')}
            className="grid size-8 place-items-center rounded-xl border border-border/60 bg-background text-muted-foreground transition hover:border-primary/25 hover:text-foreground">
            <ArrowRight className="size-3.5" />
          </button>

          <Link
            href={href}
            aria-label={`View all ${title}`}
            className="grid size-8 place-items-center rounded-xl bg-foreground text-background transition hover:bg-foreground/90">
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </header>

      {products.length > 0 ? (
        <div
          id={railId}
          className="
            flex
            snap-x
            snap-mandatory
            gap-3
            overflow-x-auto
            overscroll-x-contain
            px-4
            py-4
            scrollbar-hide

            sm:px-5
          ">
          {products.map((product, index) => (
            <DashboardProductPreview
              key={product.id}
              product={product}
              source={source}
              position={index + 1}
            />
          ))}
        </div>
      ) : (
        <div className="p-4 sm:p-5">
          <div className="flex min-h-48 items-center justify-between gap-4 rounded-xl border border-dashed border-border/70 bg-muted/20 p-4">
            <div>
              <span className="block text-3xl font-bold">0</span>

              <span className="mt-1 block text-xs font-medium text-muted-foreground">
                Nothing selected yet
              </span>
            </div>

            <Link
              href={href}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-foreground px-4 text-xs font-semibold text-background">
              Explore
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
