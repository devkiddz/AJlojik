'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Flame, ShieldCheck, Tag, TrendingUp, X } from 'lucide-react';

import { Promo } from '@/data/promos';
import { ProductType } from '@/types';
import { Button } from '@/components/ui/button';
import PromoProductCard from './PromoProductCard';
import PromoCountdown from './PromoCountdown';

type Props = {
  promo: Promo | null;
  products: ProductType[];
  open: boolean;
  onClose: () => void;
};

export default function PromoModal({ promo, products, open, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!open || !promo) return null;

  const image = promo.image ?? products[0]?.variants[0]?.image;

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 px-3 py-4 backdrop-blur-md md:px-6 md:py-8">
      <div
        ref={modalRef}
        className="relative mx-auto min-h-[90vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-background shadow-2xl">
        <button
          title="Close modal"
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80 md:right-6 md:top-6">
          <X className="h-5 w-5" />
        </button>

        {/* HERO */}
        <section className="relative min-h-[28rem] overflow-hidden md:min-h-[30rem]">
          {image ? (
            <Image
              src={image}
              alt={promo.title}
              fill
              sizes="100vw"
              className="object-cover object-center transition-transform duration-700"
              priority
            />
          ) : null}

          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-4/5 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

          <div className="relative z-10 flex min-h-[28rem] flex-col justify-end gap-6 p-5 md:min-h-[30rem] md:p-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold backdrop-blur-md"
                  style={{
                    backgroundColor: `${promo.theme?.accent}35`,
                    color: promo.theme?.accent
                  }}>
                  <Flame className="h-3 w-3" />
                  {promo.badge}
                </span>

                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white backdrop-blur-md capitalize">
                  <TrendingUp className="h-3 w-3" />
                  {promo.type}
                </span>
              </div>

              <h2 className="text-3xl font-black tracking-tight text-white md:text-5xl">{promo.title}</h2>

              {promo.subtitle ? (
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/80 md:text-base">{promo.subtitle}</p>
              ) : null}
            </div>

            <div className="w-full max-w-md lg:max-w-sm">
              <PromoCountdown startsAt={promo.startsAt} endsAt={promo.endsAt} />
            </div>
          </div>
        </section>

        {/* BODY */}
        <div className="space-y-8 p-5 md:p-8">
          {promo.description ? (
            <div className="rounded-3xl border bg-card p-5 md:p-6">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-secondary" />
                <h3 className="text-lg font-bold">Campaign Details</h3>
              </div>

              <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
                {promo.description}
              </p>
            </div>
          ) : null}

          <div className="grid gap-4 grid-cols-3">
            <div className="rounded-3xl border bg-card p-5">
              <Tag className="mb-3 h-5 w-5 text-secondary" />
              <p className="text-md md:text-xl font-black">{products.length}</p>
              <p className="text-xs font-medium text-muted-foreground">Promo products</p>
            </div>

            <div className="rounded-3xl border bg-card p-5">
              <TrendingUp className="mb-3 h-5 w-5 text-secondary" />
              <p className="text-md md:text-xl font-black capitalize">{promo.type}</p>
              <p className="text-xs font-medium text-muted-foreground">Promo category</p>
            </div>

            <div className="rounded-3xl border bg-card p-5">
              <Flame className="mb-3 h-5 w-5 text-secondary" />
              <p className="text-md md:text-xl font-black">{promo.badge}</p>
              <p className="text-xs font-medium text-muted-foreground">Active offer</p>
            </div>
          </div>

          <section className="space-y-4">
            <div>
              <h3 className="text-2xl font-black tracking-tight">Included in this campaign</h3>
              <p className="text-sm text-muted-foreground">Products currently attached to this promotion.</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map(product => (
                <PromoProductCard key={product.id} promo={promo} product={product} />
              ))}
            </div>
          </section>

          <section className="rounded-3xl border bg-card p-5 md:p-6">
            <h3 className="text-lg font-bold">Promo Terms</h3>

            {promo.terms?.length ? (
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {promo.terms.map(term => (
                  <li key={term} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Promo availability may depend on stock, selected variants and active campaign duration.
              </p>
            )}
          </section>
        </div>

        {/* FOOTER */}
        <footer className="sticky bottom-0 z-40 flex flex-col gap-3 border-t bg-background/95 p-4 backdrop-blur-md sm:flex-row sm:justify-between md:p-5">
          <Button variant="outline" onClick={onClose}>
            Continue Shopping
          </Button>

          <Link href={`/promos/${promo.slug}`} className="inline-flex">
            <Button className="w-full gap-2 sm:w-auto">
              View Full Campaign
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </footer>
      </div>
    </div>
  );
}
