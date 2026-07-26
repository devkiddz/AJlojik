'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

export function useDashboardRail() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  const sync = useCallback(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const items = Array.from(
      viewport.querySelectorAll<HTMLElement>('[data-rail-item]')
    );

    setItemCount(items.length);

    if (items.length === 0) {
      setActiveIndex(0);
      return;
    }

    const viewportLeft = viewport.getBoundingClientRect().left;

    const nearest = items.reduce(
      (best, item, index) => {
        const distance = Math.abs(
          item.getBoundingClientRect().left - viewportLeft
        );

        return distance < best.distance
          ? { index, distance }
          : best;
      },
      { index: 0, distance: Number.POSITIVE_INFINITY }
    );

    setActiveIndex(nearest.index);
  }, []);

  useEffect(() => {
    sync();

    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    viewport.addEventListener('scroll', sync, { passive: true });

    const observer = new ResizeObserver(sync);
    observer.observe(viewport);

    return () => {
      viewport.removeEventListener('scroll', sync);
      observer.disconnect();
    };
  }, [sync]);

  const scrollToIndex = useCallback((index: number) => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const items = Array.from(
      viewport.querySelectorAll<HTMLElement>('[data-rail-item]')
    );

    const target = items[index];

    target?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start'
    });
  }, []);

  const previous = useCallback(() => {
    scrollToIndex(Math.max(activeIndex - 1, 0));
  }, [activeIndex, scrollToIndex]);

  const next = useCallback(() => {
    scrollToIndex(Math.min(activeIndex + 1, itemCount - 1));
  }, [activeIndex, itemCount, scrollToIndex]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        previous();
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        next();
      }
    },
    [next, previous]
  );

  return {
    viewportRef,
    activeIndex,
    itemCount,
    previous,
    next,
    scrollToIndex,
    onKeyDown,
    canPrevious: activeIndex > 0,
    canNext: activeIndex < itemCount - 1
  };
}
