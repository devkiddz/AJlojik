'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Link from 'next/link';

import { CircleAlert, Clapperboard, Maximize2, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';

import type { FeedActions } from '@/features/feed-experience/contracts';
import { cn } from '@/lib/utils';

import type { StoreStudioReelProjection } from '../contracts';
import { useStoreReelPlayback } from '../runtime';

type StoreReelCardProps = {
  reel: StoreStudioReelProjection;
  order: number;
  actions: FeedActions;
  onExpand: (reelId: string) => void;
};

function formatDuration(durationSeconds: number): string {
  const safeDuration = Math.max(0, Math.floor(durationSeconds));
  const minutes = Math.floor(safeDuration / 60);
  const seconds = safeDuration % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function StoreReelCard({ reel, order, actions, onExpand }: StoreReelCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [mediaFailed, setMediaFailed] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const [playbackBlocked, setPlaybackBlocked] = useState(false);
  const [mediaDurationSeconds, setMediaDurationSeconds] = useState<number | null>(null);

  const {
    activeReelId,
    muted,
    reducedMotion,
    registerReel,
    reportVisibility,
    togglePlayback,
    pauseReel,
    toggleMuted
  } = useStoreReelPlayback();

  const active = activeReelId === reel.id;

  useEffect(() => {
    setMediaFailed(false);
    setMediaReady(false);
    setPlaybackBlocked(false);
    setMediaDurationSeconds(null);
  }, [reel.posterUrl, reel.videoUrl]);

  const durationLabel = useMemo(() => {
    if (mediaDurationSeconds) {
      return formatDuration(mediaDurationSeconds);
    }

    if (reel.durationMs) {
      return formatDuration(reel.durationMs / 1_000);
    }

    return null;
  }, [mediaDurationSeconds, reel.durationMs]);

  useEffect(() => {
    const unregisterReel = registerReel(reel.id, {
      autoplay: reel.autoplay,
      order
    });

    return unregisterReel;
  }, [order, reel.autoplay, reel.id, registerReel]);

  useEffect(() => {
    const card = cardRef.current;

    if (!card) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];

        reportVisibility(reel.id, entry?.intersectionRatio ?? 0);
      },
      {
        threshold: [0, 0.2, 0.35, 0.5, 0.65, 0.8, 1]
      }
    );

    observer.observe(card);

    return () => {
      observer.disconnect();
      reportVisibility(reel.id, 0);
    };
  }, [reel.id, reportVisibility]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || mediaFailed) {
      return;
    }

    video.muted = muted;

    if (!active) {
      video.pause();
      setPlaybackBlocked(false);
      return;
    }

    const playback = video.play();

    if (playback) {
      void playback
        .then(() => {
          setPlaybackBlocked(false);
        })
        .catch(() => {
          setPlaybackBlocked(true);
        });
    }
  }, [active, mediaFailed, muted]);

  const handlePlaybackToggle = useCallback(() => {
    const video = videoRef.current;

    if (active && playbackBlocked && video) {
      void video
        .play()
        .then(() => {
          setPlaybackBlocked(false);
        })
        .catch(() => {
          setPlaybackBlocked(true);
        });

      return;
    }

    setPlaybackBlocked(false);
    togglePlayback(reel.id);
  }, [active, playbackBlocked, reel.id, togglePlayback]);

  const handleMediaError = useCallback(() => {
    setMediaFailed(true);
    setMediaReady(false);
    pauseReel(reel.id);
  }, [pauseReel, reel.id]);

  const handleExpand = useCallback(() => {
    pauseReel(reel.id);
    onExpand(reel.id);
  }, [onExpand, pauseReel, reel.id]);

  const handleFeedAction = useCallback(() => {
    pauseReel(reel.id);

    if (reel.productId) {
      actions.openExperience({
        type: 'product',
        productId: reel.productId
      });
      return;
    }

    if (reel.collectionId) {
      actions.openExperience({
        type: 'collection',
        collectionId: reel.collectionId
      });
      return;
    }

    if (reel.promotionId) {
      if (actions.previewPromotion) {
        actions.previewPromotion(reel.promotionId);
        return;
      }

      actions.openExperience({
        type: 'promotion',
        promotionId: reel.promotionId
      });
    }
  }, [actions, pauseReel, reel]);

  const hasFeedAction = Boolean(reel.productId || reel.collectionId || reel.promotionId);

  const actionLabel = reel.detailHref ? 'Shop Reel' : (reel.action?.label ?? 'Discover');

  return (
    <article
      ref={cardRef}
      className="group relative aspect-[9/14] w-36 shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-sm sm:w-44">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-amber-950 to-emerald-950"
      />

      <div aria-hidden="true" className="absolute inset-0 grid place-items-center text-white/25">
        {mediaFailed ? <CircleAlert className="size-8" /> : <Clapperboard className="size-8" />}
      </div>

      {!mediaFailed ? (
        <video
          ref={videoRef}
          src={reel.videoUrl}
          poster={reel.posterUrl ?? undefined}
          preload="metadata"
          playsInline
          muted={muted}
          onCanPlay={() => setMediaReady(true)}
          onLoadedMetadata={event => {
            const duration = event.currentTarget.duration;

            if (Number.isFinite(duration)) {
              setMediaDurationSeconds(duration);
            }
          }}
          onEnded={() => pauseReel(reel.id)}
          onError={handleMediaError}
          className={cn(
            'absolute inset-0 size-full object-cover transition duration-500',
            mediaReady || reel.posterUrl ? 'opacity-100' : 'opacity-0'
          )}
        />
      ) : null}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-black/35" />

      <div className="absolute left-2 top-2 z-20 flex items-center gap-1.5">
        {mediaFailed ? (
          <span className="rounded-full border border-white/15 bg-black/40 px-2 py-1 text-[9px] font-semibold text-white/80 backdrop-blur-md">
            Media unavailable
          </span>
        ) : durationLabel ? (
          <span className="rounded-full border border-white/15 bg-black/40 px-2 py-1 text-[9px] font-semibold text-white/80 backdrop-blur-md">
            {durationLabel}
          </span>
        ) : null}

        {reducedMotion && !mediaFailed ? (
          <span className="rounded-full border border-white/15 bg-black/40 px-2 py-1 text-[9px] font-semibold text-white/80 backdrop-blur-md">
            Tap to play
          </span>
        ) : null}
      </div>

      <div className="absolute right-2 top-2 z-20 flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleExpand}
          aria-label={`Expand ${reel.title}`}
          className="grid size-8 place-items-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60">
          <Maximize2 className="size-3.5" />
        </button>

        {!mediaFailed ? (
          <>
            <button
              type="button"
              onClick={handlePlaybackToggle}
              aria-label={active ? 'Pause Reel' : 'Play Reel'}
              className="grid size-8 place-items-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60">
              {active && !playbackBlocked ? (
                <Pause className="size-3.5 fill-current" />
              ) : playbackBlocked ? (
                <RotateCcw className="size-3.5" />
              ) : (
                <Play className="size-3.5 fill-current" />
              )}
            </button>

            <button
              type="button"
              onClick={toggleMuted}
              aria-label={muted ? 'Unmute Reels' : 'Mute Reels'}
              className="grid size-8 place-items-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60">
              {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
            </button>
          </>
        ) : null}
      </div>

      {!active && !mediaFailed ? (
        <button
          type="button"
          onClick={handlePlaybackToggle}
          aria-label={`Play ${reel.title}`}
          className="absolute inset-0 z-10 grid place-items-center">
          <span className="grid size-11 place-items-center rounded-full border border-white/20 bg-black/35 text-white shadow-lg backdrop-blur-md transition group-hover:scale-105 group-hover:bg-black/50">
            <Play className="ml-0.5 size-4 fill-current" />
          </span>
        </button>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-20 p-3 text-white">
        {reel.vendorName ? (
          <p className="truncate text-[9px] font-bold uppercase tracking-[0.14em] text-white/55">
            {reel.vendorName}
          </p>
        ) : null}

        <h3 className="mt-1 line-clamp-2 text-xs font-bold leading-4">{reel.title}</h3>

        {reel.caption ? (
          <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-white/65">{reel.caption}</p>
        ) : null}

        {reel.detailHref ? (
          <Link
            href={reel.detailHref}
            onClick={() => pauseReel(reel.id)}
            className="mt-2 inline-flex rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-black transition hover:bg-white/90">
            {actionLabel}
          </Link>
        ) : hasFeedAction ? (
          <button
            type="button"
            onClick={handleFeedAction}
            className="mt-2 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-black transition hover:bg-white/90">
            {actionLabel}
          </button>
        ) : reel.action ? (
          <Link
            href={reel.action.href}
            onClick={() => pauseReel(reel.id)}
            className="mt-2 inline-flex rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-black transition hover:bg-white/90">
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </article>
  );
}
