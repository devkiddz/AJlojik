'use client';

import type { FeedIntentType } from '../contracts';

type FeedExperienceLoaderProps = {
  intentType?: FeedIntentType;
};

function getLoaderLabel(intentType?: FeedIntentType): string {
  switch (intentType) {
    case 'product':
      return 'Preparing product experience';

    case 'collection':
      return 'Opening collection';

    case 'promotion':
      return 'Loading promotion';

    case 'search':
      return 'Preparing search results';

    case 'category':
      return 'Changing category';

    default:
      return 'Preparing your experience';
  }
}

export default function FeedExperienceLoader({ intentType }: FeedExperienceLoaderProps) {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-live="polite">
      <span className="sr-only">{getLoaderLabel(intentType)}</span>

      <section className="relative overflow-hidden rounded-3xl border border-border bg-card">
        <div className="h-56 bg-muted md:h-72" />

        <div className="relative -mt-16 flex flex-col gap-5 p-5 md:-mt-20 md:flex-row md:items-end md:p-8">
          <div className="size-40 shrink-0 rounded-2xl bg-muted shadow-xl md:size-52" />

          <div className="flex-1 space-y-4 pb-2">
            <div className="h-4 w-24 rounded-full bg-muted" />

            <div className="h-9 w-3/4 rounded-lg bg-muted md:h-12 md:w-1/2" />

            <div className="h-4 w-full max-w-xl rounded-full bg-muted" />

            <div className="h-4 w-4/5 max-w-lg rounded-full bg-muted" />

            <div className="flex gap-3 pt-2">
              <div className="h-10 w-32 rounded-full bg-muted" />
              <div className="h-10 w-28 rounded-full bg-muted" />
              <div className="size-10 rounded-full bg-muted" />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="h-7 w-48 rounded-lg bg-muted" />

        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="w-56 shrink-0 space-y-3">
              <div className="aspect-square rounded-2xl bg-muted" />
              <div className="h-4 w-4/5 rounded-full bg-muted" />
              <div className="h-4 w-1/2 rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
