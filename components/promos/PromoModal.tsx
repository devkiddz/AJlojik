'use client';

import { useEffect, useRef } from 'react';
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
};

export default function PromoModal({ promo, products, open, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle Escape Key and Body Scroll Lock
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

  // Handle Click Outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!open || !promo) return null;

  const image = promo.image ?? products[0]?.variants[0]?.image;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all"
      onClick={handleOverlayClick}>
      <div
        ref={modalRef}
        className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl bg-background shadow-2xl border border-white/10">
        {/* CLOSE BUTTON */}
        <button
          title="Close modal"
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition">
          <X className="h-5 w-5" />
        </button>

        {/* HERO */}
        <div className="relative aspect-23/10 overflow-hidden">
          {image && (
            <Image
              src={image}
              alt={promo.title}
              fill
              sizes="(max-width: 1280px) 100vw, 1152px"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div
              className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold backdrop-blur-md"
              style={{ backgroundColor: `${promo.theme?.accent}35`, color: promo.theme?.accent }}>
              <Flame className="h-3 w-3" />
              {promo.badge}
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white">{promo.title}</h2>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-8 space-y-8">
          {promo.description && (
            <p className="max-w-3xl text-muted-foreground leading-relaxed">{promo.description}</p>
          )}

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Tag, label: `${products.length} Products`, sub: 'Included' },
              { icon: TrendingUp, label: promo.type, sub: 'Category' },
              { icon: Flame, label: promo.badge, sub: 'Current Offer' }
            ].map((stat, i) => (
              <div key={i} className="rounded-2xl border bg-card p-4">
                <stat.icon className="mb-2 h-5 w-5 text-secondary" />
                <p className="font-bold">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* PRODUCTS */}
          <section>
            <h3 className="text-xl font-bold mb-4">Promo Products</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map(product => (
                <PromoProductCard key={product.id} promo={promo} product={product} />
              ))}
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <footer className="sticky bottom-0 flex items-center justify-end gap-3 border-t bg-background/90 p-6 backdrop-blur-md">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Link href={`/promos/${promo.slug}`}>
            <Button className="gap-2">
              View Promo Page <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </footer>
      </div>
    </div>
  );
}
