import Image from 'next/image';
import { ArrowRight, Flame, Tag, TrendingUp } from 'lucide-react';

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
      className="promo-border group relative min-h-56 cursor-pointer overflow-hidden rounded-2xl bg-card p-px"
      onClick={() => onSelect?.(promo.id)}>
      <div className="relative min-h-56 overflow-hidden rounded-2xl p-4">
        {image ? (
          <Image
            src={image}
            alt={promo.title}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110 group-hover:contrast-105 group-hover:saturate-110"
          />
        ) : null}
        <div className="promo-spotlight absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Readability overlay */}
        {/* Ambient Tint */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Bottom readability */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

        {/* Left readability */}
        <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />

        <div className="relative z-10 flex min-h-48 flex-col justify-between">
          <div>
            <div
              className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold backdrop-blur-md"
              style={{
                backgroundColor: `${promo.theme?.accent}30`,
                color: promo.theme?.accent
              }}>
              <Flame className="h-3 w-3" />
              {promo.badge}
            </div>

            <h3 className="line-clamp-1 text-lg font-bold text-white">{promo.title}</h3>

            {promo.subtitle && <p className="mt-1 line-clamp-2 text-sm text-white/80">{promo.subtitle}</p>}

            <div className="mt-4 mb-4 flex items-center gap-3 text-xs text-white/75">
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {products.length} products
              </span>

              <span className="flex items-center gap-1 capitalize">
                <TrendingUp className="h-3 w-3" />
                {promo.type}
              </span>
            </div>
          </div>

          <PromoCountdown startsAt={promo.startsAt} endsAt={promo.endsAt} />

          <Button
            type="button"
            variant="secondary"
            className="promo-button mt-5 w-full gap-2 rounded-full cursor-pointer shadow-none"
            onClick={e => {
              e.stopPropagation();
              onSelect?.(promo.id);
            }}>
            View Promo
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
