'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from 'react';

import {
  cn
} from '@/lib/utils';

type DashboardSnapRailProps = {
  children: ReactNode;
  itemCount: number;
  ariaLabel: string;
  className?: string;
};

export function DashboardSnapRail({
  children,
  itemCount,
  ariaLabel,
  className
}: DashboardSnapRailProps) {
  const railRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const frameRef =
    useRef<number | null>(null);

  const [
    activeIndex,
    setActiveIndex
  ] = useState(0);

  const updateActiveIndex =
    useCallback(() => {
      const rail =
        railRef.current;

      if (!rail) {
        return;
      }

      const items =
        Array.from(
          rail.querySelectorAll<HTMLElement>(
            '[data-dashboard-snap-card="true"]'
          )
        );

      if (items.length === 0) {
        setActiveIndex(0);
        return;
      }

      const railLeft =
        rail.getBoundingClientRect()
          .left;

      let closestIndex = 0;
      let closestDistance =
        Number.POSITIVE_INFINITY;

      items.forEach(
        (item, index) => {
          const distance =
            Math.abs(
              item.getBoundingClientRect()
                .left -
                railLeft
            );

          if (
            distance <
            closestDistance
          ) {
            closestIndex = index;
            closestDistance =
              distance;
          }
        }
      );

      setActiveIndex(
        closestIndex
      );
    }, []);

  const handleScroll =
    useCallback(() => {
      if (
        frameRef.current != null
      ) {
        cancelAnimationFrame(
          frameRef.current
        );
      }

      frameRef.current =
        requestAnimationFrame(
          updateActiveIndex
        );
    }, [updateActiveIndex]);

  useEffect(() => {
    updateActiveIndex();

    window.addEventListener(
      'resize',
      updateActiveIndex
    );

    return () => {
      window.removeEventListener(
        'resize',
        updateActiveIndex
      );

      if (
        frameRef.current != null
      ) {
        cancelAnimationFrame(
          frameRef.current
        );
      }
    };
  }, [
    itemCount,
    updateActiveIndex
  ]);

  return (
    <div className="min-w-0">
      <div
        ref={railRef}
        role="region"
        aria-label={ariaLabel}
        onScroll={handleScroll}
        className={cn(
          '-mx-3 flex snap-x snap-mandatory items-start gap-3 overflow-x-auto overscroll-x-contain px-3 pb-1 scroll-px-3 scrollbar-hide',
          'lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0',
          className
        )}>
        {children}
      </div>

      {itemCount > 1 ? (
        <div
          className="mt-2 flex items-center justify-center gap-1.5 lg:hidden"
          aria-label={`Slide ${activeIndex + 1} of ${itemCount}`}>
          {Array.from({
            length: itemCount
          }).map((_, index) => (
            <span
              key={index}
              aria-hidden="true"
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                index ===
                  activeIndex
                  ? 'w-5 bg-foreground'
                  : 'w-1.5 bg-border'
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
