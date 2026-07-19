'use client';

import PromoSection from '@/components/promos/PromoSection';
import { promos } from '@/data/promos';
import { useCatalog } from '@/features/catalog';

export default function PromotionsPage() {
  const { products } = useCatalog();

  return (
    <main className="mx-auto min-h-dvh w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 max-w-3xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/70">AJ Logik campaigns</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">Promos made for the moment</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
          Explore live savings, premium selections, and seasonal shopping experiences.
        </p>
      </header>

      <PromoSection promos={promos} products={products} />
    </main>
  );
}
