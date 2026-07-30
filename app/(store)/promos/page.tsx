'use client';

import { useRouter } from 'next/navigation';
import { BadgePercent, Sparkles } from 'lucide-react';

import PromoCard from '@/components/promos/PromoCard';
import { promos } from '@/data/promos';
import { useCatalog } from '@/features/catalog';

export default function PromotionsPage() {
  const router = useRouter();
  const { products } = useCatalog();
  const activePromos = promos
    .filter(promo => promo.active)
    .sort((firstPromo, secondPromo) => firstPromo.priority - secondPromo.priority);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[96rem] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card p-6 shadow-xl sm:p-9">
        <div className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="size-3.5" />
            AJ Logik campaigns
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">Promos made for the moment</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            Explore every live saving, premium selection and seasonal shopping experience in one responsive campaign grid.
          </p>
        </div>
      </header>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">All promotions</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">Campaign grid</h2>
          </div>
          <span className="rounded-full border border-border/60 bg-card px-3 py-1.5 text-sm font-semibold text-muted-foreground">
            {activePromos.length} live
          </span>
        </div>

        {activePromos.length ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {activePromos.map(promo => (
              <PromoCard
                key={promo.id}
                promo={promo}
                products={products.filter(product => promo.productIds.includes(product.id))}
                onSelect={() => router.push(promo.href ?? `/promos/${promo.slug}`)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 grid min-h-72 place-items-center rounded-[2rem] border border-dashed border-border/70 bg-muted/20 p-8 text-center">
            <div>
              <BadgePercent className="mx-auto size-8 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-bold">No live promotions</h2>
              <p className="mt-2 text-sm text-muted-foreground">New campaigns will appear here after publication.</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
