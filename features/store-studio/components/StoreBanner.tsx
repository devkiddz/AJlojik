'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  useEffect,
  useMemo,
  useState
} from 'react';

import { cn } from '@/lib/utils';

import type {
  StoreStudioBannerSlideProjection
} from '../contracts';

type StoreBannerProps = {
  slides: StoreStudioBannerSlideProjection[];
};

export function StoreBanner({
  slides
}: StoreBannerProps) {
  const orderedSlides = useMemo(
    () =>
      [...slides].sort(
        (firstSlide, secondSlide) =>
          firstSlide.position - secondSlide.position
      ),
    [slides]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [mediaFailed, setMediaFailed] = useState(false);

  const activeSlide = orderedSlides[activeIndex];

  useEffect(() => {
    setMediaFailed(false);
  }, [activeSlide?.id]);

  useEffect(() => {
    if (
      !activeSlide ||
      orderedSlides.length < 2 ||
      !activeSlide.autoplay
    ) {
      return;
    }

    const timer = window.setTimeout(
      () =>
        setActiveIndex(
          index => (index + 1) % orderedSlides.length
        ),
      activeSlide.durationMs
    );

    return () => window.clearTimeout(timer);
  }, [activeSlide, orderedSlides.length]);

  useEffect(() => {
    if (activeIndex < orderedSlides.length) {
      return;
    }

    setActiveIndex(0);
  }, [activeIndex, orderedSlides.length]);

  if (!activeSlide) {
    return null;
  }

  const hasDesktopMedia =
    activeSlide.mediaUrl.trim().length > 0;

  const hasMobileMedia =
    Boolean(activeSlide.mobileMediaUrl?.trim());

  const showMedia = hasDesktopMedia && !mediaFailed;

  return (
    <section
      aria-label={activeSlide.title || 'Store banner'}
      className="relative isolate overflow-hidden rounded-3xl border border-border/50 bg-zinc-950 shadow-sm"
    >
      <div className="relative aspect-[16/8] min-h-44 sm:aspect-[16/5] sm:min-h-52">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-amber-950/80 to-emerald-950"
        />

        <div
          aria-hidden="true"
          className="absolute -right-16 -top-24 size-72 rounded-full bg-amber-500/25 blur-3xl sm:size-96"
        />

        <div
          aria-hidden="true"
          className="absolute -bottom-32 right-[8%] size-72 rounded-full bg-emerald-500/20 blur-3xl sm:size-[28rem]"
        />

        {showMedia ? (
          activeSlide.mediaType === 'video' ? (
            <video
              src={activeSlide.mediaUrl}
              poster={activeSlide.posterUrl ?? undefined}
              autoPlay={activeSlide.autoplay}
              muted
              loop
              playsInline
              onError={() => setMediaFailed(true)}
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <>
              {hasMobileMedia ? (
                <Image
                  src={activeSlide.mobileMediaUrl!}
                  alt=""
                  fill
                  priority
                  sizes="100vw"
                  onError={() => setMediaFailed(true)}
                  className="object-cover sm:hidden"
                />
              ) : null}

              <Image
                src={activeSlide.mediaUrl}
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
                onError={() => setMediaFailed(true)}
                className={cn(
                  'object-cover',
                  hasMobileMedia && 'hidden sm:block'
                )}
              />
            </>
          )
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />

        <div className="absolute inset-0 flex items-center justify-center px-5 pb-14 pt-4 sm:p-8 sm:pb-16">
          <div className="mx-auto max-w-[18rem] -translate-y-3 text-center text-white sm:max-w-xl sm:translate-y-0">
            {activeSlide.eyebrow ? (
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/70 sm:text-[10px] sm:tracking-[0.2em]">
                {activeSlide.eyebrow}
              </p>
            ) : null}

            <h1 className="mt-1.5 text-xl font-black tracking-tight sm:mt-2 sm:text-4xl">
              {activeSlide.title || 'Discover AJ Logik'}
            </h1>

            {activeSlide.description ? (
              <p className="mt-1.5 line-clamp-2 text-[11px] leading-4 text-white/75 sm:mt-2 sm:text-sm sm:leading-5">
                {activeSlide.description}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:mt-4">
              {activeSlide.primaryAction ? (
                <Link
                  href={activeSlide.primaryAction.href}
                  className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-black transition hover:bg-white/90 sm:px-4 sm:py-2 sm:text-xs"
                >
                  {activeSlide.primaryAction.label}
                </Link>
              ) : null}

              {activeSlide.secondaryAction ? (
                <Link
                  href={activeSlide.secondaryAction.href}
                  className="rounded-full border border-white/30 bg-black/20 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur transition hover:bg-black/35 sm:px-4 sm:py-2 sm:text-xs"
                >
                  {activeSlide.secondaryAction.label}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {orderedSlides.length > 1 ? (
        <div className="absolute bottom-3 right-4 flex gap-1.5">
          {orderedSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Show banner ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'h-1.5 rounded-full bg-white/45 transition-all',
                index === activeIndex
                  ? 'w-6 bg-white'
                  : 'w-1.5'
              )}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
