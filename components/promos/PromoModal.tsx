'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Flame, Tag, TrendingUp, ArrowRight } from 'lucide-react';

import { Promo } from '@/data/promos';
import { ProductType } from '@/types';
import { Button } from '@/components/ui/button';
import PromoProductCard from './PromoProductCard';

type Props = {
  promo: Promo | null;
  products: ProductType[];
  open: boolean;
  onClose: () => void;
  //   onSelectProduct?: (id: string) => void;
};

export default function PromoModal({ promo, products, open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open || !promo) return null;

  const image = promo.image ?? products[0]?.variants[0]?.image;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md">
      <div className="mx-auto my-6 w-full max-w-6xl rounded-3xl bg-background shadow-2xl">
        {/* HERO */}
        <div className="relative aspect-23/10 overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={promo.title}
              fill
              sizes="100vw"
              className="object-cover object-top-center"
            />
          ) : null}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />

          <button
            title="close modal"
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md">
            <X className="h-5 w-5" />
          </button>

          <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-8">
            <div
              className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold backdrop-blur-md"
              style={{
                backgroundColor: `${promo.theme?.accent}35`,
                color: promo.theme?.accent
              }}>
              <Flame className="h-3 w-3" />
              {promo.badge}
            </div>

            <h2 className="max-w-2xl text-3xl font-black text-white md:text-4xl">{promo.title}</h2>

            {promo.subtitle ? (
              <p className="mt-2 max-w-2xl text-sm text-white/80 md:text-base">{promo.subtitle}</p>
            ) : null}
          </div>
        </div>

        {/* BODY */}
        <div className=" p-5 md:p-8  scrollbar-none">
          <div className="space-y-7">
            {promo.description ? (
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
                {promo.description}
              </p>
            ) : null}

            {/* STATS */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border bg-card p-4">
                <Tag className="mb-2 h-5 w-5 text-secondary" />
                <p className="text-sm font-bold">{products.length} Products</p>
                <p className="text-xs text-muted-foreground">Included in promo</p>
              </div>

              <div className="rounded-2xl border bg-card p-4">
                <TrendingUp className="mb-2 h-5 w-5 text-secondary" />
                <p className="text-sm font-bold capitalize">{promo.type}</p>
                <p className="text-xs text-muted-foreground">Promo category</p>
              </div>

              <div className="rounded-2xl border bg-card p-4">
                <Flame className="mb-2 h-5 w-5 text-secondary" />
                <p className="text-sm font-bold">{promo.badge}</p>
                <p className="text-xs text-muted-foreground">Current offer</p>
              </div>
            </div>

            {/* PRODUCTS */}
            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">Promo Products</h3>
                  <p className="text-sm text-muted-foreground">Products attached to this campaign.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map(product => (
                  <PromoProductCard key={product.id} promo={promo} product={product} />
                ))}
              </div>
            </div>
          </div>

          {/* TERMS */}
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="text-sm font-bold">Promo Terms</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Promo availability may depend on stock, selected variants and active campaign duration.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center gap-3 border-t bg-background/95 p-5 backdrop-blur-md sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>

          <Link href={`/promos/${promo.slug}`} className="inline-flex">
            <Button className="gap-2">
              View Promo Page
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
