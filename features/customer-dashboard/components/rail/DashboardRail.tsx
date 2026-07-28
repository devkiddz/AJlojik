'use client';

import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useDashboardRail } from './useDashboardRail';

type DashboardRailProps = {
  title: string;
  code: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
};

export function DashboardRail({ title, code, icon, children, className }: DashboardRailProps) {
  const {
    viewportRef,
    activeIndex,
    itemCount,
    previous,
    next,
    scrollToIndex,
    onKeyDown,
    canPrevious,
    canNext
  } = useDashboardRail();

  return (
    <section
      className={cn('overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-sm', className)}>
      <header className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary [&_svg]:size-4">
            {icon}
          </span>

          <h2 className="truncate text-lg font-bold sm:text-xl">{title}</h2>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-lg bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground sm:inline-flex">
            {code}
          </span>

          <div className="hidden items-center gap-1 sm:flex">
            <button
              type="button"
              onClick={previous}
              disabled={!canPrevious}
              aria-label={`Previous ${title}`}
              className="grid size-8 place-items-center rounded-xl border border-border/60 bg-background transition hover:border-primary/25 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-35">
              <ChevronLeft className="size-4" />
            </button>

            <button
              type="button"
              onClick={next}
              disabled={!canNext}
              aria-label={`Next ${title}`}
              className="grid size-8 place-items-center rounded-xl border border-border/60 bg-background transition hover:border-primary/25 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-35">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </header>

      <div
        ref={viewportRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className={cn(
          `
            flex snap-x snap-mandatory
            gap-3 overflow-x-auto
            overscroll-x-contain
            px-4 py-4
            outline-none
            scrollbar-hide
            sm:px-5
          `,
          `
            [--dashboard-rail-card-width:calc(66.666%_-_0.5rem)]
          `,
          `
            sm:[--dashboard-rail-card-width:calc((100%_-_0.75rem)/2)]
          `,
          `
            lg:[--dashboard-rail-card-width:calc((100%_-_1.5rem)/3)]
          `
        )}>
        {children}
      </div>

      {itemCount > 1 ? (
        <div className="flex items-center justify-center gap-1.5 border-t border-border/40 py-2.5 sm:hidden">
          {Array.from({
            length: itemCount
          }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollToIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={cn(
                'h-1.5 rounded-full transition-all',
                activeIndex === index ? 'w-5 bg-foreground' : 'w-1.5 bg-border'
              )}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
