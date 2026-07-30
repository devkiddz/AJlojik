'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent
} from 'react';

const EDGE_TOLERANCE = 4;

function directRailItems(viewport: HTMLDivElement): HTMLElement[] {
  return Array.from(viewport.children).filter(
    (element): element is HTMLElement =>
      element instanceof HTMLElement && element.hasAttribute('data-rail-item')
  );
}

export function useDashboardRail() {
  const viewportElementRef = useRef<HTMLDivElement | null>(null);
  const [viewportElement, setViewportElement] = useState<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [canPrevious, setCanPrevious] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback(() => {
    const viewport = viewportElementRef.current;

    if (!viewport) {
      setItemCount(0);
      setActiveIndex(0);
      setCanPrevious(false);
      setCanNext(false);
      return;
    }

    const items = directRailItems(viewport);
    const maximumScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);

    setItemCount(items.length);

    if (items.length === 0) {
      setActiveIndex(0);
      setCanPrevious(false);
      setCanNext(false);
      return;
    }

    const firstOffset = items[0]?.offsetLeft ?? 0;
    const currentScroll = viewport.scrollLeft;
    const nearest = items.reduce(
      (best, item, index) => {
        const normalizedOffset = Math.max(0, item.offsetLeft - firstOffset);
        const distance = Math.abs(normalizedOffset - currentScroll);
        return distance < best.distance ? { index, distance } : best;
      },
      { index: 0, distance: Number.POSITIVE_INFINITY }
    );

    setActiveIndex(nearest.index);
    setCanPrevious(currentScroll > EDGE_TOLERANCE || nearest.index > 0);
    setCanNext(
      items.length > 1 &&
        (maximumScroll - currentScroll > EDGE_TOLERANCE || nearest.index < items.length - 1)
    );
  }, []);

  const viewportRef = useCallback(
    (element: HTMLDivElement | null) => {
      viewportElementRef.current = element;
      setViewportElement(element);

      if (element) {
        window.requestAnimationFrame(sync);
      }
    },
    [sync]
  );

  useEffect(() => {
    if (!viewportElement) return;

    let frame = 0;
    const scheduleSync = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(sync);
    };

    scheduleSync();
    viewportElement.addEventListener('scroll', scheduleSync, { passive: true });

    const resizeObserver = new ResizeObserver(scheduleSync);
    resizeObserver.observe(viewportElement);

    for (const item of directRailItems(viewportElement)) {
      resizeObserver.observe(item);
    }

    const mutationObserver = new MutationObserver(() => {
      for (const item of directRailItems(viewportElement)) {
        resizeObserver.observe(item);
      }
      scheduleSync();
    });
    mutationObserver.observe(viewportElement, { childList: true });

    window.addEventListener('resize', scheduleSync);

    return () => {
      window.cancelAnimationFrame(frame);
      viewportElement.removeEventListener('scroll', scheduleSync);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', scheduleSync);
    };
  }, [sync, viewportElement]);

  const scrollToIndex = useCallback((index: number) => {
    const viewport = viewportElementRef.current;
    if (!viewport) return;

    const items = directRailItems(viewport);
    const target = items[index];
    const first = items[0];
    if (!target || !first) return;

    viewport.scrollTo({
      left: Math.max(0, target.offsetLeft - first.offsetLeft),
      behavior: 'smooth'
    });
  }, []);

  const scrollByCard = useCallback(
    (direction: 'previous' | 'next') => {
      const viewport = viewportElementRef.current;
      if (!viewport) return;

      const items = directRailItems(viewport);
      if (items.length === 0) return;

      const targetIndex =
        direction === 'previous'
          ? Math.max(0, activeIndex - 1)
          : Math.min(items.length - 1, activeIndex + 1);

      scrollToIndex(targetIndex);
    },
    [activeIndex, scrollToIndex]
  );

  const previous = useCallback(() => scrollByCard('previous'), [scrollByCard]);
  const next = useCallback(() => scrollByCard('next'), [scrollByCard]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        previous();
      } else if (event.key === 'ArrowRight') {
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
    canPrevious,
    canNext
  };
}
