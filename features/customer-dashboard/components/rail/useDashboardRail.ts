'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent
} from 'react';

export function useDashboardRail() {
  const viewportElementRef =
    useRef<HTMLDivElement | null>(null);

  const [viewportElement, setViewportElement] =
    useState<HTMLDivElement | null>(null);

  const [activeIndex, setActiveIndex] =
    useState(0);

  const [itemCount, setItemCount] =
    useState(0);

  const viewportRef = useCallback(
    (element: HTMLDivElement | null) => {
      viewportElementRef.current =
        element;

      setViewportElement(element);
    },
    []
  );

  const getItems = useCallback(
    (
      viewport: HTMLDivElement
    ): HTMLElement[] =>
      Array.from(
        viewport.querySelectorAll<HTMLElement>(
          '[data-rail-item]'
        )
      ),
    []
  );

  const sync = useCallback(() => {
    const viewport =
      viewportElementRef.current;

    if (!viewport) {
      setItemCount(0);
      setActiveIndex(0);

      return;
    }

    const items =
      getItems(viewport);

    setItemCount(items.length);

    if (items.length === 0) {
      setActiveIndex(0);

      return;
    }

    const viewportLeft =
      viewport.getBoundingClientRect().left;

    const nearest = items.reduce(
      (best, item, index) => {
        const distance =
          Math.abs(
            item.getBoundingClientRect()
              .left - viewportLeft
          );

        return distance <
          best.distance
          ? {
              index,
              distance
            }
          : best;
      },
      {
        index: 0,
        distance:
          Number.POSITIVE_INFINITY
      }
    );

    setActiveIndex(
      nearest.index
    );
  }, [getItems]);

  useEffect(() => {
    if (!viewportElement) {
      return;
    }

    sync();

    viewportElement.addEventListener(
      'scroll',
      sync,
      {
        passive: true
      }
    );

    const resizeObserver =
      new ResizeObserver(sync);

    resizeObserver.observe(
      viewportElement
    );

    const mutationObserver =
      new MutationObserver(sync);

    mutationObserver.observe(
      viewportElement,
      {
        childList: true,
        subtree: true
      }
    );

    return () => {
      viewportElement.removeEventListener(
        'scroll',
        sync
      );

      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [
    sync,
    viewportElement
  ]);

  const scrollToIndex =
    useCallback(
      (index: number) => {
        const viewport =
          viewportElementRef.current;

        if (!viewport) {
          return;
        }

        const items =
          getItems(viewport);

        if (
          index < 0 ||
          index >= items.length
        ) {
          return;
        }

        items[
          index
        ]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start'
        });
      },
      [getItems]
    );

  const previous =
    useCallback(() => {
      scrollToIndex(
        Math.max(
          activeIndex - 1,
          0
        )
      );
    }, [
      activeIndex,
      scrollToIndex
    ]);

  const next =
    useCallback(() => {
      scrollToIndex(
        Math.min(
          activeIndex + 1,
          Math.max(
            itemCount - 1,
            0
          )
        )
      );
    }, [
      activeIndex,
      itemCount,
      scrollToIndex
    ]);

  const onKeyDown =
    useCallback(
      (
        event: KeyboardEvent<HTMLDivElement>
      ) => {
        if (
          event.key ===
          'ArrowLeft'
        ) {
          event.preventDefault();
          previous();

          return;
        }

        if (
          event.key ===
          'ArrowRight'
        ) {
          event.preventDefault();
          next();
        }
      },
      [
        next,
        previous
      ]
    );

  return {
    viewportRef,

    activeIndex,
    itemCount,

    previous,
    next,
    scrollToIndex,
    onKeyDown,

    canPrevious:
      activeIndex > 0,

    canNext:
      itemCount > 0 &&
      activeIndex <
        itemCount - 1
  };
}