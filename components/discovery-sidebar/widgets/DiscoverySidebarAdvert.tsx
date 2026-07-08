'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { promos } from '@/data/promos';
import { products } from '@/data/products';

export default function DiscoverySidebarAdvert() {
  const adverts = useMemo(
    () =>
      promos
        .filter(promo => promo.active)
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 4),
    []
  );

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (adverts.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveIndex(prev => (prev + 1) % adverts.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, [adverts.length]);

  const advert = adverts[activeIndex];

  if (!advert) return null;

  const fallbackProduct = advert.productIds
    .map(id => products.find(product => product.id === id))
    .find(Boolean);

  const image = advert.image ?? fallbackProduct?.variants[0]?.image;

  return (
    <section className="overflow-hidden rounded-3xl border bg-card">
      <div className="relative min-h-56 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={advert.title}
            fill
            sizes="320px"
            className="object-cover object-top transition-transform duration-700 hover:scale-105"
          />
        ) : null}

        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-4/5 bg-gradient-to-r from-black/75 via-black/30 to-transparent" />

        <div className="relative z-10 flex min-h-56 flex-col justify-between p-4">
          <span
            className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-bold backdrop-blur-md"
            style={{
              backgroundColor: `${advert.theme?.accent}35`,
              color: advert.theme?.accent
            }}>
            <Sparkles className="h-3 w-3" />
            {advert.badge}
          </span>

          <div>
            <h3 className="line-clamp-2 text-lg font-black text-white">{advert.title}</h3>

            {advert.subtitle ? (
              <p className="mt-1 line-clamp-2 text-xs text-white/75">{advert.subtitle}</p>
            ) : null}

            <Button size="sm" variant="secondary" className="mt-4 h-8 gap-2 rounded-full text-xs">
              Explore
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
