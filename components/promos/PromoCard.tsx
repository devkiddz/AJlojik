import Image from 'next/image';
import { ArrowRight, Flame, Package, TrendingUp } from 'lucide-react';

import { Promo } from '@/data/promos';
import { ProductType } from '@/types';
import { Button } from '@/components/ui/button';
import PromoCountdown from './PromoCountdown';

type Props = {
  promo: Promo;
  products: ProductType[];
  onSelect?: (id: string) => void;
};

export default function PromoCard({ promo, products, onSelect }: Props) {
  const firstProduct = products[0];
  const image = promo.image ?? firstProduct?.variants[0]?.image;

  return (
    <article
      onClick={() => onSelect?.(promo.id)}
      className="promo-border group relative min-h-80 cursor-pointer overflow-hidden rounded-2xl bg-card p-px transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40">
      <div className="relative flex min-h-80 overflow-hidden rounded-2xl p-4">
        {image ? (
          <Image
            src={image}
            alt={promo.title}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110 group-hover:contrast-105 group-hover:saturate-110"
          />
        ) : null}

        <div className="promo-spotlight absolute inset-0 scale-110 opacity-0 transition-all duration-700 group-hover:scale-100 group-hover:opacity-100" />

        <div className="absolute inset-0 bg-black/30 transition-all duration-500 group-hover:bg-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/90 via-black/55 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-3/4 bg-gradient-to-r from-black/80 via-black/35 to-transparent" />

        <div className="relative z-10 flex w-full flex-col justify-between">
          {/* TOP */}
          <div className="max-w-sm">
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
            </div>

            <h3 className="line-clamp-1 text-xl font-black text-white">{promo.title}</h3>

            {promo.subtitle ? (
              <p className="mt-2 line-clamp-2 text-sm text-white/85">{promo.subtitle}</p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-white/85">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                <Package className="h-3 w-3" />
                {products.length} Products
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 capitalize backdrop-blur-md">
                <TrendingUp className="h-3 w-3" />
                {promo.type}
              </span>

              {promo.discountPercent ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                  Save {promo.discountPercent}%
                </span>
              ) : null}
            </div>
          </div>

          {/* BOTTOM */}
          <div className="flex w-full flex-col gap-3">
            <div>
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-secondary animate-pulse" />

              <PromoCountdown startsAt={promo.startsAt} endsAt={promo.endsAt} compact />
            </div>

            <Button
              type="button"
              variant="secondary"
              className="promo-button w-full gap-2 rounded-full transition-all duration-500 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
              onClick={e => {
                e.stopPropagation();
                onSelect?.(promo.id);
              }}>
              View Promo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
