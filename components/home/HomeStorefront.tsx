import Image from 'next/image';
import Link from 'next/link';

import { ArrowRight, ChevronRight, Sparkles } from 'lucide-react';

import { categories } from '@/data/categories';

import HeroBackgroundMedia from './HeroBackgroundMedia';

type StorefrontHeroConfig = {
  mediaType: string;
  mediaUrl: string | null;
  posterUrl: string | null;

  eyebrow: string;
  title: string;
  summary: string | null;

  primaryLabel: string;
  primaryHref: string;

  secondaryLabel: string;
  secondaryHref: string;

  autoplay: boolean;
} | null;

type HomeStorefrontProps = {
  hero: StorefrontHeroConfig;
};

const DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1575444758702-4a6b9222336e?q=85&w=2400&auto=format&fit=crop';

const homeCategories = categories
  .filter(category => category.slug !== 'all' && category.slug !== 'featured')
  .slice(0, 6);

export default function HomeStorefront({ hero }: HomeStorefrontProps) {
  const heroMedia = hero?.mediaUrl?.trim() || hero?.posterUrl?.trim() || DEFAULT_HERO_IMAGE;

  const heroFallbackImage = hero?.posterUrl?.trim() || DEFAULT_HERO_IMAGE;

  const eyebrow = hero?.eyebrow?.trim() || 'The AJ Logik experience';

  const title = hero?.title?.trim() || 'Everything beautiful begins with the right experience.';

  const summary =
    hero?.summary?.trim() ||
    'Discover premium wines, thoughtful meals and unforgettable moments—carefully arranged around the experience you want to create.';

  /*
   * Empty labels or links hide an action.
   * This allows Admin to control whether either CTA renders.
   */
  const primaryLabel = hero ? hero.primaryLabel.trim() : 'Explore AJ Logik';

  const primaryHref = hero ? hero.primaryHref.trim() : '/store';

  const secondaryLabel = hero ? hero.secondaryLabel.trim() : 'Discover wines';

  const secondaryHref = hero ? hero.secondaryHref.trim() : '/store?category=wines';

  const showPrimaryAction = Boolean(primaryLabel && primaryHref);

  const showSecondaryAction = Boolean(secondaryLabel && secondaryHref);

  return (
    <section
      className="
        relative isolate
        h-full min-h-0 w-full
        overflow-hidden
        bg-[#030509]
        text-white
      ">
      {/* =====================================================
          HERO BACKGROUND

          Admin controls the uploaded image/video.
          The fallback remains a premium wine-shop image.
      ====================================================== */}

      <HeroBackgroundMedia
        mediaType={hero?.mediaType ?? 'IMAGE'}
        mediaUrl={heroMedia}
        fallbackImage={heroFallbackImage}
        autoplay={hero?.autoplay ?? true}
      />

      {/* Cinematic overlays */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0
          bg-black/30
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0
          bg-[linear-gradient(90deg,rgba(2,5,10,0.94)_0%,rgba(2,5,10,0.74)_38%,rgba(2,5,10,0.26)_72%,rgba(2,5,10,0.35)_100%)]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0
          bg-[linear-gradient(0deg,rgba(2,4,8,0.98)_0%,rgba(2,4,8,0.68)_18%,transparent_52%,rgba(2,4,8,0.2)_100%)]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute -left-44 top-1/4
          size-[32rem]
          rounded-full
          bg-amber-300/10
          blur-3xl
        "
      />

      {/* =====================================================
          HERO CONTENT

          The grid reserves a dedicated bottom region for
          category cards without creating page scrolling.
      ====================================================== */}

      <div
        className="
          relative z-10
          grid h-full min-h-0
          grid-rows-[minmax(0,1fr)_auto]
        ">
        {/* Main message */}

        <div
          className="
            flex min-h-0
            items-center
            px-6 pb-4 pt-6
            sm:px-10 sm:pt-8
            lg:px-16
            xl:px-20
          ">
          <div className="max-w-3xl">
            <div
              className="
                inline-flex items-center
                gap-2
                rounded-full
                border border-white/15
                bg-black/20
                px-3 py-1.5
                text-[0.65rem] font-bold
                uppercase tracking-[0.18em]
                text-white/85
                shadow-lg
                backdrop-blur-md
              ">
              <Sparkles className="size-3.5 text-amber-300" />

              {eyebrow}
            </div>

            <h1
              className="
                mt-5 max-w-3xl
                text-4xl font-black
                leading-[0.95]
                tracking-[-0.05em]
                text-balance
                sm:mt-6 sm:text-6xl
                lg:text-7xl
                xl:text-8xl
              ">
              {title}
            </h1>

            <p
              className="
                mt-4 max-w-xl
                text-sm leading-6
                text-white/70
                sm:mt-5 sm:text-base
                sm:leading-7
              ">
              {summary}
            </p>

            {showPrimaryAction || showSecondaryAction ? (
              <div className="mt-6 flex flex-wrap gap-3 sm:mt-7">
                {showPrimaryAction ? (
                  <Link
                    href={primaryHref}
                    className="
                      inline-flex h-12
                      items-center justify-center
                      gap-2 rounded-xl
                      bg-white px-5
                      text-sm font-bold
                      text-[#07101d]
                      shadow-xl
                      transition duration-300
                      hover:-translate-y-0.5
                      hover:bg-white/90
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-white
                      focus-visible:ring-offset-2
                      focus-visible:ring-offset-black
                    ">
                    {primaryLabel}

                    <ArrowRight className="size-4" />
                  </Link>
                ) : null}

                {showSecondaryAction ? (
                  <Link
                    href={secondaryHref}
                    className="
                      inline-flex h-12
                      items-center justify-center
                      gap-2 rounded-xl
                      border border-white/20
                      bg-black/25 px-5
                      text-sm font-bold
                      text-white
                      shadow-lg
                      backdrop-blur-md
                      transition duration-300
                      hover:-translate-y-0.5
                      hover:border-white/35
                      hover:bg-white/10
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-white
                      focus-visible:ring-offset-2
                      focus-visible:ring-offset-black
                    ">
                    {secondaryLabel}

                    <ChevronRight className="size-4" />
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {/* =================================================
            CATEGORY ENTRANCE

            Categories remain inside the Hero.
            Mobile scrolls horizontally.
            Desktop remains centred.
        ================================================== */}

        <div
          className="
            relative
            px-4 pb-4
            sm:px-6 sm:pb-6
            lg:px-10 lg:pb-8
          ">
          <div className="mx-auto w-full max-w-6xl">
            <div
              className="
                mb-3 flex
                items-end justify-between
                gap-4 px-1
              ">
              <div>
                <p
                  className="
                    text-[0.62rem] font-bold
                    uppercase tracking-[0.18em]
                    text-amber-300
                  ">
                  Choose your experience
                </p>

                <p className="mt-1 text-xs text-white/55 sm:text-sm">
                  Enter AJ Logik through what interests you.
                </p>
              </div>

              <Link
                href="/store"
                className="
                  hidden items-center gap-1
                  text-xs font-semibold
                  text-white/65
                  transition
                  hover:text-white
                  sm:inline-flex
                ">
                Explore all
                <ChevronRight className="size-4" />
              </Link>
            </div>

            <div
              className="
                -mx-4 flex
                snap-x snap-mandatory
                gap-3 overflow-x-auto
                px-4 pb-1
                scrollbar-none
                sm:mx-0 sm:px-0
                lg:justify-center
              ">
              {homeCategories.map(category => {
                const categoryImage = category.coverImages?.[0] ?? category.image;

                return (
                  <Link
                    key={category.id}
                    href={`/store?category=${category.slug}`}
                    className="
                        group relative
                        h-24 w-36
                        shrink-0 snap-start
                        overflow-hidden
                        rounded-2xl
                        border border-white/15
                        bg-white/5
                        shadow-[0_18px_50px_rgba(0,0,0,0.35)]
                        transition duration-300
                        hover:-translate-y-1
                        hover:border-white/30
                        hover:shadow-[0_24px_60px_rgba(0,0,0,0.45)]
                        sm:h-28 sm:w-40
                        lg:h-32 lg:w-44
                      ">
                    <Image
                      src={categoryImage}
                      alt={category.label}
                      fill
                      sizes="
                          (max-width: 640px) 144px,
                          (max-width: 1024px) 160px,
                          176px
                        "
                      className="
                          object-cover
                          transition duration-700
                          group-hover:scale-105
                        "
                    />

                    <div
                      className="
                          absolute inset-0
                          bg-gradient-to-t
                          from-black/95
                          via-black/30
                          to-black/5
                        "
                    />

                    <div
                      className="
                          absolute inset-x-0 bottom-0
                          flex items-end
                          justify-between gap-2
                          p-3
                          sm:p-4
                        ">
                      <div className="min-w-0">
                        <p
                          className="
                              truncate
                              text-sm font-bold
                              text-white
                              sm:text-base
                            ">
                          {category.label}
                        </p>

                        <p
                          className="
                              mt-0.5 hidden
                              truncate text-[0.65rem]
                              text-white/60
                              sm:block
                            ">
                          {category.shortDescription || 'Explore experience'}
                        </p>
                      </div>

                      <span
                        className="
                            grid size-7
                            shrink-0 place-items-center
                            rounded-full
                            border border-white/20
                            bg-black/25
                            text-white/80
                            backdrop-blur-md
                            transition
                            group-hover:border-white/40
                            group-hover:bg-white
                            group-hover:text-black
                          ">
                        <ChevronRight className="size-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
