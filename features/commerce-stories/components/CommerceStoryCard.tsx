'use client';

import Image from 'next/image';
import { Play } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { CommerceStory } from '../contracts';

type CommerceStoryCardProps = {
  story: CommerceStory;
  viewed: boolean;
  emphasized?: boolean;
  showLabel?: boolean;
  compact?: boolean;
  onOpen: (story: CommerceStory) => void;
};

export function CommerceStoryCard({
  story,
  viewed,
  emphasized = false,
  showLabel = true,
  compact = false,
  onOpen
}: CommerceStoryCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(story)}
      aria-label={`Open ${story.title}`}
      className={cn(
        `
          group shrink-0 snap-start
          text-left sm:w-20
        `,
        compact ? 'w-14' : 'w-[4.5rem]',
        !showLabel && 'drop-shadow-md'
      )}>
      <span
        className={cn(
          `
            relative isolate block aspect-square
            rounded-full
            transition duration-300
            group-hover:scale-[1.04]
          `,
          compact ? 'p-0.5 sm:p-[3px]' : 'p-[3px]',
          viewed
            ? 'bg-border'
            : 'bg-gradient-to-tr from-yellow-500 via-amber-600 to-emerald-500'
        )}>
        {!viewed && emphasized ? (
          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute -inset-1
              -z-10 motion-safe:animate-pulse
              rounded-full bg-gradient-to-tr
              from-yellow-500 via-amber-600 to-emerald-500
              opacity-30 blur-sm
            "
          />
        ) : null}

        <span
          className="
            relative block size-full
            overflow-hidden rounded-full
            border-2 border-background
            bg-muted
          ">
          <Image
            src={story.coverUrl}
            alt=""
            fill
            sizes="80px"
            style={{ objectPosition: story.coverObjectPosition }}
            className="
              object-cover
              transition duration-500
              group-hover:scale-105
            "
          />

          <span
            className="
              absolute inset-0
              bg-gradient-to-t
              from-black/25
              via-transparent
              to-transparent
            "
          />

          {story.mediaType === 'video' ? (
            <span
              className="
                absolute bottom-1 right-1
                grid size-5 place-items-center
                rounded-full border border-white/30
                bg-black/55 text-white
                backdrop-blur-sm
              ">
              <Play className="size-2.5 fill-current" />
            </span>
          ) : null}
        </span>
      </span>

      {showLabel ? (
        <span
          className={cn(
            `
              mt-1.5 block truncate
              text-center text-[10px]
            `,
            viewed ? 'text-muted-foreground' : 'text-foreground'
          )}>
          {story.title}
        </span>
      ) : null}
    </button>
  );
}
