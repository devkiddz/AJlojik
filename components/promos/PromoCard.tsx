import Image from 'next/image';

import { ArrowRight, Package, Sparkles, TrendingUp } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { Promo } from '@/data/promos';

import type { ProductType } from '@/types/types';

import PromoCountdown from './PromoCountdown';

type Props = {
  promo: Promo;
  products: ProductType[];
  onSelect?: (id: string) => void;
};

const CHAMPAGNE_GOLD = '#D4AF37';
const DEEP_NAVY = '#070D1D';

export default function PromoCard({ promo, products, onSelect }: Props) {
  const firstProduct = products[0];

  const image = promo.image ?? firstProduct?.variants[0]?.image;

  const accent = promo.theme?.accent ?? CHAMPAGNE_GOLD;

  const openPromo = (): void => {
    onSelect?.(promo.id);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Open ${promo.title}`}
      onClick={openPromo}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();

          openPromo();
        }
      }}
      className="
        group relative isolate
        h-52 cursor-pointer
        overflow-hidden rounded-2xl
        border border-amber-400/25
        bg-[#070d1d]
        p-px
        shadow-lg
        transition-all
        duration-500
        hover:-translate-y-0.5
        hover:border-amber-300/50
        hover:shadow-2xl
        hover:shadow-black/60
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-amber-300/70
        sm:h-56
      ">
      <div
        className="
          relative isolate
          h-full overflow-hidden
          rounded-[calc(1rem-1px)]
          bg-[#070d1d]
        ">
        {/* ============================================
            CAMPAIGN IMAGE
        ============================================ */}

        {image ? (
          <Image
            src={image}
            alt={promo.title}
            fill
            sizes="
              (max-width: 640px) 88vw,
              (max-width: 1024px) 60vw,
              48vw
            "
            className="
              object-cover
              contrast-[1.18]
              saturate-[1.32]
              brightness-[0.82]
              transition-[transform,filter]
              duration-700
              ease-out
              group-hover:scale-[1.035]
              group-hover:contrast-[1.24]
              group-hover:saturate-[1.42]
              group-hover:brightness-[0.88]
            "
          />
        ) : null}

        {/* ============================================
            NAVY COLOR FOUNDATION
        ============================================ */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-0
            bg-[#061027]/55
            mix-blend-multiply
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-0
            bg-gradient-to-r
            from-[#030712]/95
            via-[#071329]/60
            to-[#0a1128]/10
          "
        />

        {/* ============================================
            CHAMPAGNE COLOR BLEND
        ============================================ */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-0
            opacity-55
            mix-blend-overlay
            transition-opacity
            duration-700
            group-hover:opacity-80
          "
          style={{
            background: `
              linear-gradient(
                118deg,
                color-mix(
                  in oklab,
                  ${accent} 28%,
                  transparent
                ) 0%,
                transparent 38%,
                color-mix(
                  in oklab,
                  ${accent} 16%,
                  transparent
                ) 72%,
                transparent 100%
              )
            `
          }}
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-0
            opacity-45
            mix-blend-soft-light
            transition-opacity
            duration-700
            group-hover:opacity-70
          "
          style={{
            background: `
              radial-gradient(
                circle at 18% 12%,
                color-mix(
                  in oklab,
                  ${accent} 72%,
                  white
                ) 0%,
                color-mix(
                  in oklab,
                  ${accent} 30%,
                  transparent
                ) 24%,
                transparent 52%
              ),
              radial-gradient(
                circle at 85% 82%,
                color-mix(
                  in oklab,
                  ${accent} 42%,
                  transparent
                ) 0%,
                transparent 48%
              )
            `
          }}
        />

        {/* ============================================
            CHAMPAGNE HIGHLIGHTS
        ============================================ */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute -left-20 -top-28
            size-72 rounded-full
            opacity-30 blur-3xl
            mix-blend-screen
            transition-all
            duration-1000
            ease-out
            group-hover:translate-x-7
            group-hover:translate-y-5
            group-hover:opacity-45
          "
          style={{
            backgroundColor: accent
          }}
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute -bottom-28 -right-20
            size-64 rounded-full
            opacity-20 blur-3xl
            mix-blend-screen
            transition-all
            duration-1000
            ease-out
            group-hover:-translate-x-6
            group-hover:-translate-y-4
            group-hover:opacity-35
          "
          style={{
            backgroundColor: accent
          }}
        />

        {/* Narrow champagne light sweep */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute -inset-y-16
            -left-1/2
            w-1/3
            rotate-[18deg]
            bg-gradient-to-r
            from-transparent
            via-amber-100/15
            to-transparent
            opacity-0
            blur-xl
            mix-blend-screen
            transition-all
            duration-1000
            ease-out
            group-hover:left-[115%]
            group-hover:opacity-100
          "
        />

        {/* ============================================
            READABILITY AND DEPTH
        ============================================ */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-x-0 bottom-0
            h-28
            bg-gradient-to-t
            from-[#020617]/95
            via-[#050b18]/65
            to-transparent
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-0
            shadow-[inset_0_0_4rem_rgba(0,0,0,0.45)]
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-0
            rounded-[calc(1rem-1px)]
            ring-1
            ring-inset
            ring-white/5
          "
        />

        {/* ============================================
            CAMPAIGN CONTENT
        ============================================ */}

        <div
          className="
            relative z-10
            flex h-full w-full
            flex-col justify-between
            p-4
            sm:p-5
          ">
          <div className="min-w-0 max-w-[88%]">
            {/* Campaign badge */}

            <span
              className="
                inline-flex items-center
                gap-1.5 rounded-full
                border px-3 py-1
                text-[0.62rem]
                font-semibold uppercase
                tracking-[0.14em]
                shadow-sm
                backdrop-blur-md
              "
              style={{
                borderColor: `color-mix(
                  in oklab,
                  ${accent} 42%,
                  transparent
                )`,

                backgroundColor: `color-mix(
                  in oklab,
                  ${accent} 16%,
                  ${DEEP_NAVY}
                )`,

                color: `color-mix(
                  in oklab,
                  ${accent} 82%,
                  white
                )`
              }}>
              <Sparkles
                className="size-3"
                style={{
                  color: accent
                }}
              />

              {promo.badge}
            </span>

            {/* Campaign title */}

            <h3
              className="
                mt-2.5 line-clamp-1
                font-serif text-xl
                font-medium tracking-wide
                text-white
                drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]
                sm:text-2xl
              ">
              {promo.title}
            </h3>

            {/* Campaign subtitle */}

            {promo.subtitle ? (
              <p
                className="
                  mt-1 line-clamp-1
                  text-xs font-light
                  leading-relaxed
                  tracking-wide
                  text-slate-200/80
                  sm:text-sm
                ">
                {promo.subtitle}
              </p>
            ) : null}

            {/* Campaign metadata */}

            <div
              className="
                mt-3 flex flex-wrap
                items-center gap-1.5
                text-[0.62rem]
                font-medium uppercase
                tracking-[0.08em]
                text-slate-200/90
              ">
              <span
                className="
                  inline-flex items-center
                  gap-1 rounded-full
                  border border-white/10
                  bg-[#071329]/65
                  px-2.5 py-1
                  shadow-sm
                  backdrop-blur-md
                ">
                <Package className="size-3 text-amber-200/80" />
                {products.length} {products.length === 1 ? 'Item' : 'Items'}
              </span>

              <span
                className="
                  inline-flex items-center
                  gap-1 rounded-full
                  border border-white/10
                  bg-[#071329]/65
                  px-2.5 py-1
                  capitalize
                  shadow-sm
                  backdrop-blur-md
                ">
                <TrendingUp className="size-3 text-amber-200/80" />

                {promo.type}
              </span>

              {promo.discountPercent ? (
                <span
                  className="
                    rounded-full
                    border px-2.5 py-1
                    font-semibold
                    backdrop-blur-md
                  "
                  style={{
                    borderColor: `color-mix(
                      in oklab,
                      ${accent} 38%,
                      transparent
                    )`,

                    backgroundColor: `color-mix(
                      in oklab,
                      ${accent} 18%,
                      ${DEEP_NAVY}
                    )`,

                    color: `color-mix(
                      in oklab,
                      ${accent} 80%,
                      white
                    )`
                  }}>
                  Save {promo.discountPercent}%
                </span>
              ) : null}
            </div>
          </div>

          {/* ============================================
              COUNTDOWN AND ACTION
          ============================================ */}

          <div
            className="
              flex min-w-0
              items-end justify-between
              gap-3
              border-t border-white/10
              pt-3
            ">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="
                    size-1.5 shrink-0
                    animate-pulse
                    rounded-full
                    shadow-[0_0_0.75rem_currentColor]
                  "
                  style={{
                    backgroundColor: accent,
                    color: accent
                  }}
                />

                <PromoCountdown startsAt={promo.startsAt} endsAt={promo.endsAt} compact />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="
                shrink-0 gap-1.5
                rounded-full
                border-amber-300/35
                bg-[#071329]/80
                px-4
                text-xs font-semibold
                uppercase
                tracking-[0.1em]
                text-amber-100
                shadow-md
                backdrop-blur-md
                transition-all
                duration-300
                hover:border-amber-200
                hover:bg-amber-300
                hover:text-[#050a14]
              "
              onClick={event => {
                event.stopPropagation();

                openPromo();
              }}>
              Discover
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
