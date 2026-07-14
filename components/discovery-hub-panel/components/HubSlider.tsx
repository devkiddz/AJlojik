'use client';

import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useFeedExperience } from '@/features/feed-experience';
import { cn } from '@/lib/utils';

import type { HubSlideItem } from '../discoveryHubTypes';

type HubSliderProps = {
  items: HubSlideItem[];
  autoSlide?: boolean;
  variant?: 'hero' | 'strip' | 'grid' | 'minimal-grid';
};

const formatPrice = (price?: number) => {
  if (!price) return null;

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(price);
};

export default function HubSlider({ items, autoSlide = false, variant = 'strip' }: HubSliderProps) {
  const { actions } = useFeedExperience();

  const [activeIndex, setActiveIndex] = useState(0);

  const safeItems = useMemo(() => items.filter(Boolean), [items]);

  const activeItem = safeItems[activeIndex];

  const openItem = (item: HubSlideItem) => {
    if (item.target) {
      actions.openExperience(item.target);

      return;
    }

    if (item.id.startsWith('prod_')) {
      actions.openExperience({
        type: 'product',
        productId: item.id
      });
    }
  };

  const showPrevious = () => {
    setActiveIndex(current => (current === 0 ? safeItems.length - 1 : current - 1));
  };

  const showNext = () => {
    setActiveIndex(current => (current + 1) % safeItems.length);
  };

  useEffect(() => {
    if (!autoSlide || safeItems.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex(current => (current + 1) % safeItems.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [autoSlide, safeItems.length]);

  if (!safeItems.length) {
    return null;
  }

  // ============================================================
  // EDITORIAL HERO
  // Large immersive promo/deal with navigation controls.
  // ============================================================

  if (variant === 'hero' && activeItem) {
    const activePrice = formatPrice(activeItem.price);

    return (
      <div>
        <div className="group relative overflow-hidden rounded-3xl border border-primary/10 bg-background shadow-[0_24px_70px_rgba(0,0,0,0.38)]">
          <div className="grid min-h-66 grid-cols-5">
            {/* ====================================================
              PROMOTION DETAILS — LEFT
          ==================================================== */}

            <div className="relative col-span-3 flex min-w-0 flex-col justify-between overflow-hidden p-5 md:p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-card via-background to-background" />

              <div className="absolute -left-20 -top-20 size-52 rounded-full bg-primary/5 blur-3xl" />

              <div className="relative">
                <div className="flex items-center gap-2">
                  <span className="h-px w-7 bg-primary/30" />

                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/45">
                    Featured promotion
                  </p>
                </div>

                <h4 className="mt-5 text-xl font-bold leading-tight tracking-tight text-primary">
                  {activeItem.title}
                </h4>

                {activeItem.subtitle && (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-primary/55">{activeItem.subtitle}</p>
                )}

                {activePrice && (
                  <div className="mt-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/35">
                      Promotional price
                    </p>

                    <p className="mt-1 text-lg font-bold text-primary">{activePrice}</p>
                  </div>
                )}
              </div>

              <div className="relative mt-6">
                <button
                  type="button"
                  onClick={() => openItem(activeItem)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-background transition hover:opacity-90">
                  Explore promotion
                  <ArrowRight className="size-4" />
                </button>

                {safeItems.length > 1 && (
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <div className="flex gap-1.5">
                      {safeItems.map((item, index) => (
                        <button
                          key={item.id}
                          type="button"
                          title={`Show ${item.title}`}
                          onClick={() => setActiveIndex(index)}
                          className={cn(
                            'h-1.5 rounded-full transition-all duration-300',
                            index === activeIndex
                              ? 'w-7 bg-primary'
                              : 'w-1.5 bg-primary/20 hover:bg-primary/40'
                          )}
                        />
                      ))}
                    </div>

                    <span className="shrink-0 text-[10px] font-medium text-primary/35">
                      {String(activeIndex + 1).padStart(2, '0')} / {String(safeItems.length).padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ====================================================
              PRODUCT IMAGE — RIGHT
          ==================================================== */}

            <div className="relative col-span-2 min-h-66 overflow-hidden border-l border-primary/10 bg-card">
              <button
                type="button"
                onClick={() => openItem(activeItem)}
                aria-label={`Explore ${activeItem.title}`}
                className="absolute inset-0 block h-full w-full overflow-hidden text-left">
                <Image
                  src={activeItem.image}
                  alt={activeItem.title}
                  fill
                  sizes="(max-width: 1024px) 40vw, 280px"
                  className="object-cover object-center transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-transparent" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/5" />
              </button>

              {activeItem.badge && (
                <span className="pointer-events-none absolute right-3 top-3 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-xl">
                  {activeItem.badge}
                </span>
              )}

              <span className="pointer-events-none absolute bottom-4 left-3 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[9px] font-medium text-white/75 backdrop-blur-xl">
                AJ Logik
              </span>

              {safeItems.length > 1 && (
                <div className="absolute bottom-4 right-3 flex gap-2">
                  <button
                    type="button"
                    onClick={showPrevious}
                    aria-label="Previous promotion"
                    className="grid size-8 place-items-center rounded-full border border-white/10 bg-black/45 text-white backdrop-blur transition hover:bg-black/70">
                    <ChevronLeft className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={showNext}
                    aria-label="Next promotion"
                    className="grid size-8 place-items-center rounded-full border border-white/10 bg-black/45 text-white backdrop-blur transition hover:bg-black/70">
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  // ============================================================
  // THREE-PRODUCT VIEW
  // Exactly three products, so there is no incomplete second row.
  // ============================================================

  if (variant === 'grid' || variant === 'minimal-grid') {
    const visibleItems = safeItems.slice(0, 3);

    return (
      <div className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-3">
        {visibleItems.map(item => (
          <button
            type="button"
            key={item.id}
            onClick={() => openItem(item)}
            className="group overflow-hidden rounded-2xl border border-primary/10 bg-background/45 text-left shadow-[0_12px_35px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-background/60">
            <div className="relative aspect-[3/4] min-h-32 overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 31vw, 140px"
                className="object-cover transition duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

              {item.badge && (
                <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur">
                  {item.badge}
                </span>
              )}
            </div>

            <div className="p-2.5">
              <p className="line-clamp-2 min-h-8 text-[11px] font-semibold leading-4 text-primary">
                {item.title}
              </p>

              {variant === 'grid' && item.subtitle && (
                <p className="mt-1 line-clamp-1 text-[10px] text-primary/50">{item.subtitle}</p>
              )}

              {variant === 'grid' && formatPrice(item.price) && (
                <p className="mt-2 truncate text-[11px] font-bold text-primary/80">
                  {formatPrice(item.price)}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    );
  }

  // ============================================================
  // COMPACT STRIP
  // ============================================================

  return (
    <div className="mt-5 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
      {safeItems.map(item => (
        <button
          type="button"
          key={item.id}
          onClick={() => openItem(item)}
          className="w-28 shrink-0 text-left">
          <div className="relative aspect-square w-28 overflow-hidden rounded-2xl border border-primary/10 bg-background shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="112px"
              className="object-cover transition duration-500 hover:scale-105"
            />
          </div>

          <p className="mt-2 line-clamp-2 text-[11px] font-medium leading-4 text-primary/75">{item.title}</p>

          {formatPrice(item.price) && (
            <p className="mt-1 text-[11px] font-semibold text-primary/45">{formatPrice(item.price)}</p>
          )}
        </button>
      ))}
    </div>
  );
}
