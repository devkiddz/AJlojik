'use client';

import Image from 'next/image';

import { Play } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { CommerceStory } from '../contracts';

type CommerceStoryCardProps = {
  story: CommerceStory;
  viewed: boolean;
  emphasized?: boolean;

  onOpen: (story: CommerceStory) => void;
};

export function CommerceStoryCard({ story, viewed, emphasized = false, onOpen }: CommerceStoryCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(story)}
      aria-label={`Open ${story.title}`}
      className="
        group w-[4.5rem] shrink-0
        snap-start text-left
        sm:w-20
      ">
      <span
        className={cn(
          `
            relative block aspect-square
            rounded-full p-[3px]
            transition duration-300
            group-hover:scale-[1.04]
          `,

          viewed
            ? 'bg-muted-foreground/25'
            : `
                bg-gradient-to-tr
                from-amber-400
                via-rose-500
                to-fuchsia-500
              `
        )}>
        {!viewed && emphasized ? (
          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute inset-0
              animate-ping rounded-full
              border border-primary/30
              opacity-20
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

      <span
        className={cn(
          `
            mt-1.5 block truncate
            text-center text-[10px]
            font-medium tracking-tight
          `,

          viewed ? 'text-muted-foreground' : 'text-foreground'
        )}>
        {story.title}
      </span>
    </button>
  );
}
