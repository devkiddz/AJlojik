'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Pause,
  Play,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle
} from '@/components/ui/dialog';
import type { FeedActions } from '@/features/feed-experience/contracts';

import type { CommerceStory } from '../contracts';

type CommerceStoryViewerProps = {
  stories: CommerceStory[];
  activeStoryId: string | null;
  actions: FeedActions;
  onActiveStoryChange: (storyId: string) => void;
  onViewed: (storyId: string) => void;
  onClose: () => void;
};

const DEFAULT_IMAGE_DURATION_MS = 5_000;
const PROGRESS_INTERVAL_MS = 50;

export function CommerceStoryViewer({
  stories,
  activeStoryId,
  actions,
  onActiveStoryChange,
  onViewed,
  onClose
}: CommerceStoryViewerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageElapsedRef = useRef(0);

  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [mediaFailed, setMediaFailed] = useState(false);

  const activeIndex = useMemo(
    () => stories.findIndex(story => story.id === activeStoryId),
    [activeStoryId, stories]
  );

  const activeStory = activeIndex >= 0 ? stories[activeIndex] : null;
  const canMovePrevious = activeIndex > 0;
  const canMoveNext = activeIndex >= 0 && activeIndex < stories.length - 1;

  const movePrevious = useCallback(() => {
    if (!canMovePrevious) {
      return;
    }

    const previousStory = stories[activeIndex - 1];

    if (previousStory) {
      onActiveStoryChange(previousStory.id);
    }
  }, [activeIndex, canMovePrevious, onActiveStoryChange, stories]);

  const moveNext = useCallback(() => {
    if (!canMoveNext) {
      onClose();
      return;
    }

    const nextStory = stories[activeIndex + 1];

    if (nextStory) {
      onActiveStoryChange(nextStory.id);
    }
  }, [activeIndex, canMoveNext, onActiveStoryChange, onClose, stories]);

  useEffect(() => {
    if (!activeStory) {
      return;
    }

    onViewed(activeStory.id);
    imageElapsedRef.current = 0;
    setProgress(0);
    setMediaFailed(false);
    setPlaying(true);
  }, [activeStory, onViewed]);

  useEffect(() => {
    if (
      !activeStory ||
      activeStory.mediaType !== 'image' ||
      !playing ||
      mediaFailed
    ) {
      return;
    }

    const durationMs = Math.max(
      1_000,
      activeStory.durationMs ?? DEFAULT_IMAGE_DURATION_MS
    );

    const interval = window.setInterval(() => {
      imageElapsedRef.current += PROGRESS_INTERVAL_MS;

      const nextProgress = Math.min(
        100,
        (imageElapsedRef.current / durationMs) * 100
      );

      setProgress(nextProgress);

      if (nextProgress >= 100) {
        window.clearInterval(interval);
        moveNext();
      }
    }, PROGRESS_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [activeStory, mediaFailed, moveNext, playing]);

  const togglePlayback = useCallback(async (): Promise<void> => {
    if (!activeStory) {
      return;
    }

    if (activeStory.mediaType === 'image') {
      setPlaying(current => !current);
      return;
    }

    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      try {
        await video.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }

      return;
    }

    video.pause();
    setPlaying(false);
  }, [activeStory]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        movePrevious();
      }

      if (event.key === 'ArrowRight') {
        moveNext();
      }

      if (event.key === 'Escape') {
        onClose();
      }

      if (event.key === ' ') {
        event.preventDefault();
        void togglePlayback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveNext, movePrevious, onClose, togglePlayback]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        return;
      }

      videoRef.current?.pause();
      setPlaying(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handlePrimaryAction = (): void => {
    if (!activeStory) {
      return;
    }

    switch (activeStory.actionType) {
      case 'product': {
        const productId = activeStory.productIds?.[0];

        if (!productId) {
          return;
        }

        actions.openExperience({
          type: 'product',
          productId
        });
        onClose();
        return;
      }

      case 'promotion': {
        if (!activeStory.promotionId) {
          return;
        }

        if (actions.previewPromotion) {
          actions.previewPromotion(activeStory.promotionId);
        } else {
          actions.openExperience({
            type: 'promotion',
            promotionId: activeStory.promotionId
          });
        }

        onClose();
        return;
      }

      case 'collection': {
        if (!activeStory.collectionId) {
          return;
        }

        actions.openExperience({
          type: 'collection',
          collectionId: activeStory.collectionId
        });
        onClose();
        return;
      }

      case 'vendor': {
        if (!activeStory.actionHref) {
          return;
        }

        router.push(activeStory.actionHref);
        onClose();
        return;
      }

      case 'none':
        return;
    }
  };

  return (
    <Dialog
      open={Boolean(activeStory)}
      onOpenChange={open => {
        if (!open) {
          onClose();
        }
      }}>
      <DialogContent
        showCloseButton={false}
        className="left-0 top-[calc(var(--app-navbar-height)+var(--pwa-safe-top))] h-[calc(100dvh-var(--app-navbar-height)-var(--pwa-safe-top))] max-h-none w-[100vw] max-w-[100vw] translate-x-0 translate-y-0 overflow-hidden rounded-t-[1.75rem] border-0 border-t border-white/10 bg-black p-0 shadow-[0_-18px_55px_rgba(0,0,0,0.32)] sm:left-1/2 sm:top-1/2 sm:h-[min(92dvh,52rem)] sm:w-[min(92vw,30rem)] sm:max-w-[30rem] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border sm:border-white/10">
        <DialogTitle className="sr-only">
          {activeStory?.title ?? 'Commerce Story'}
        </DialogTitle>

        {activeStory ? (
          <div className="relative size-full bg-black">
            <div className="absolute left-3 right-3 top-3 z-30 flex gap-1">
              {stories.map((story, index) => (
                <span
                  key={story.id}
                  className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
                  <span
                    className="block h-full bg-white transition-[width] duration-75"
                    style={{
                      width:
                        index < activeIndex
                          ? '100%'
                          : index === activeIndex
                            ? `${progress}%`
                            : '0%'
                    }}
                  />
                </span>
              ))}
            </div>

            <div className="absolute left-3 right-3 top-6 z-30 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white drop-shadow-md">
                  {activeStory.title}
                </p>

                {activeStory.label ? (
                  <p className="mt-0.5 truncate text-[11px] text-white/70">
                    {activeStory.label}
                  </p>
                ) : null}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close Story"
                className="size-9 rounded-full bg-black/25 text-white hover:bg-black/45 hover:text-white">
                <X className="size-4" />
              </Button>
            </div>

            <div className="absolute inset-0">
              {mediaFailed ? (
                <div className="grid size-full place-items-center bg-gradient-to-br from-zinc-950 via-amber-950 to-emerald-950 px-8 text-center text-white">
                  <div>
                    <CircleAlert className="mx-auto size-10 text-white/35" />
                    <p className="mt-4 text-sm font-bold">Story media unavailable</p>
                    <p className="mt-2 text-xs leading-5 text-white/55">
                      The campaign destination remains available below.
                    </p>
                  </div>
                </div>
              ) : activeStory.mediaType === 'video' ? (
                <video
                  key={activeStory.id}
                  ref={videoRef}
                  src={activeStory.mediaUrl}
                  poster={activeStory.posterUrl ?? activeStory.coverUrl}
                  autoPlay
                  playsInline
                  muted={muted}
                  onEnded={moveNext}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onError={() => {
                    setMediaFailed(true);
                    setPlaying(false);
                  }}
                  onTimeUpdate={event => {
                    const video = event.currentTarget;

                    if (Number.isFinite(video.duration) && video.duration > 0) {
                      setProgress(
                        Math.min(100, (video.currentTime / video.duration) * 100)
                      );
                    }
                  }}
                  className="size-full object-contain sm:object-cover"
                />
              ) : (
                <Image
                  key={activeStory.id}
                  src={activeStory.mediaUrl}
                  alt={activeStory.title}
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, 480px"
                  onError={() => {
                    setMediaFailed(true);
                    setPlaying(false);
                  }}
                  className="object-contain sm:object-cover"
                />
              )}
            </div>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/70" />

            <button
              type="button"
              aria-label="Previous Story"
              onClick={movePrevious}
              disabled={!canMovePrevious}
              className="absolute inset-y-20 left-0 z-20 w-1/3 disabled:cursor-default"
            />

            <button
              type="button"
              aria-label="Next Story"
              onClick={moveNext}
              className="absolute inset-y-20 right-0 z-20 w-1/3"
            />

            <div className="absolute bottom-4 left-4 right-4 z-30 flex items-end justify-between gap-3">
              <div className="flex items-center gap-2">
                {!mediaFailed ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    onClick={() => void togglePlayback()}
                    aria-label={playing ? 'Pause Story' : 'Play Story'}
                    className="size-9 rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-md hover:bg-black/55 hover:text-white">
                    {playing ? (
                      <Pause className="size-4" />
                    ) : (
                      <Play className="size-4" />
                    )}
                  </Button>
                ) : null}

                {activeStory.mediaType === 'video' && !mediaFailed ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    onClick={() => setMuted(currentMuted => !currentMuted)}
                    aria-label={muted ? 'Unmute Story' : 'Mute Story'}
                    className="size-9 rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-md hover:bg-black/55 hover:text-white">
                    {muted ? (
                      <VolumeX className="size-4" />
                    ) : (
                      <Volume2 className="size-4" />
                    )}
                  </Button>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  disabled={!canMovePrevious}
                  onClick={movePrevious}
                  aria-label="Previous Story"
                  className="hidden size-9 rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-white/25 hover:text-white sm:inline-flex">
                  <ChevronLeft className="size-4" />
                </Button>

                {activeStory.actionType !== 'none' ? (
                  <Button
                    type="button"
                    onClick={handlePrimaryAction}
                    className="rounded-full px-5 text-xs font-semibold">
                    {activeStory.actionLabel ?? 'Discover'}
                  </Button>
                ) : null}

                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  onClick={moveNext}
                  aria-label="Next Story"
                  className="hidden size-9 rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-white/25 hover:text-white sm:inline-flex">
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
