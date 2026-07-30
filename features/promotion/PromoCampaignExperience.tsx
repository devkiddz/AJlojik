'use client';

import Image from 'next/image';
import Link from 'next/link';

import { ArrowLeft, ArrowRight, Flame, ShieldCheck, Tag } from 'lucide-react';
import CollectionProductRail from '@/features/collection/components/CollectionProductRail';
import PromoCountdown from '@/components/promos/PromoCountdown';
import type { Promo } from '@/data/promos';
import { useCart } from '@/features/cart';
import { useCatalog } from '@/features/catalog';
import { openCustomerProductExperience } from '@/features/customer-experience';

export default function PromoCampaignExperience({ promo }: { promo: Promo }) {
  const { products } = useCatalog();
  const { addToCart } = useCart();
  const promoProducts = products.filter(product => promo.productIds.includes(product.id));
  const heroImage = promo.image ?? promoProducts[0]?.variants[0]?.image;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-8">
      <Link
        href="/promos"
        className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground">
        <ArrowLeft className="size-4" /> All promotions
      </Link>

      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl sm:min-h-[28rem]">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={promo.title}
            fill
            priority
            sizes="100vw"
            className="object-cover transition duration-700 hover:scale-[1.02]"
          />
        ) : null}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-black/80 to-transparent" />

        <div className="relative z-10 flex min-h-[22rem] max-w-3xl flex-col justify-end p-6 text-white sm:min-h-[28rem] sm:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur-xl">
              <Flame className="size-3.5" />
              {promo.badge}
            </span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold capitalize backdrop-blur-xl">
              {promo.type}
            </span>
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">{promo.title}</h1>
          {promo.subtitle ? (
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/75 sm:text-base">{promo.subtitle}</p>
          ) : null}
          <div className="mt-6 max-w-md">
            <PromoCountdown startsAt={promo.startsAt} endsAt={promo.endsAt} />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href="#campaign-products"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-black">
              Shop campaign <ArrowRight className="size-4" />
            </a>
            <Link
              href="/store"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold backdrop-blur-xl">
              Continue browsing
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <article className="rounded-[2rem] border border-border/60 bg-card/70 p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <h2 className="text-lg font-bold">Campaign details</h2>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            {promo.description ??
              'Selected products and savings are available while this campaign remains active.'}
          </p>
        </article>
        <article className="rounded-[2rem] border border-border/60 bg-card/70 p-6">
          <div className="flex items-center gap-2">
            <Tag className="size-5 text-primary" />
            <h2 className="text-lg font-bold">Offer summary</h2>
          </div>
          <p className="mt-3 text-2xl font-bold">
            {promo.discountPercent ? `${promo.discountPercent}% off` : promo.badge}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Across {promoProducts.length} selected products
          </p>
        </article>
      </section>

      <section id="campaign-products" className="mt-8 min-w-0 scroll-mt-24">
        <div className="flex min-w-0 items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/70">
              Included selection
            </p>

            <h2 className="mt-1 truncate text-2xl font-bold tracking-tight">Shop this campaign</h2>
          </div>

          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            {promoProducts.length} {promoProducts.length === 1 ? 'product' : 'products'}
          </span>
        </div>

        <div className="mt-4 min-w-0">
          <CollectionProductRail
            title={promo.title}
            subtitle={promo.subtitle}
            showHeader={false}
            products={promoProducts}
            onPreview={product => {
              openCustomerProductExperience({
                id: product.id,
                name: product.name,
                shortDescription: product.shortDescription
              });
            }}
            onOpenExperience={product => {
              openCustomerProductExperience({
                id: product.id,
                name: product.name,
                shortDescription: product.shortDescription
              });
            }}
            onAddToCart={(product, variant) => {
              void addToCart({
                product,
                variant,
                quantity: 1
              });
            }}
          />
        </div>
      </section>

      {promo.terms?.length ? (
        <section className="mt-8 rounded-[2rem] border border-border/60 bg-card/60 p-6">
          <h2 className="text-lg font-bold">Terms</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {promo.terms.map(term => (
              <li key={term} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                {term}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
