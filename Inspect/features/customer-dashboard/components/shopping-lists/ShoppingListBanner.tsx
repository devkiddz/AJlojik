'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from 'react';

import {
  ArrowLeft,
  ArrowRight,
  ListChecks,
  ListPlus,
  Plus
} from 'lucide-react';

import type { ShoppingList } from '@/features/shopping-lists';

import { ShoppingListPreviewCard } from './ShoppingListPreviewCard';

type ShoppingListBannerProps = {
  lists: ShoppingList[];
};

const EDGE_TOLERANCE = 4;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(value);
}

export function ShoppingListBanner({ lists }: ShoppingListBannerProps) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideCount, setSlideCount] = useState(lists.length + 1);
  const [canPrevious, setCanPrevious] = useState(false);
  const [canNext, setCanNext] = useState(lists.length > 0);

  const totalItems = lists.reduce((total, list) => total + list.itemCount, 0);
  const totalQuantity = lists.reduce((total, list) => total + list.totalQuantity, 0);
  const totalValue = lists.reduce((total, list) => total + list.totalValue, 0);

  const syncControls = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const slides = Array.from(rail.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && element.hasAttribute('data-shopping-list-slide')
    );

    const maximumScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const firstOffset = slides[0]?.offsetLeft ?? 0;
    const nearest = slides.reduce(
      (best, slide, index) => {
        const normalizedOffset = Math.max(0, slide.offsetLeft - firstOffset);
        const distance = Math.abs(normalizedOffset - rail.scrollLeft);
        return distance < best.distance ? { index, distance } : best;
      },
      { index: 0, distance: Number.POSITIVE_INFINITY }
    );

    setSlideCount(slides.length);
    setActiveIndex(nearest.index);
    setCanPrevious(rail.scrollLeft > EDGE_TOLERANCE || nearest.index > 0);
    setCanNext(
      slides.length > 1 &&
        (maximumScroll - rail.scrollLeft > EDGE_TOLERANCE || nearest.index < slides.length - 1)
    );
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const scheduleSync = () => window.requestAnimationFrame(syncControls);
    scheduleSync();

    rail.addEventListener('scroll', scheduleSync, { passive: true });
    const resizeObserver = new ResizeObserver(scheduleSync);
    resizeObserver.observe(rail);

    const mutationObserver = new MutationObserver(scheduleSync);
    mutationObserver.observe(rail, { childList: true, subtree: true });

    return () => {
      rail.removeEventListener('scroll', scheduleSync);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [lists.length, syncControls]);

  const scroll = (direction: 'left' | 'right') => {
    const rail = railRef.current;
    if (!rail) return;

    const slides = Array.from(rail.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && element.hasAttribute('data-shopping-list-slide')
    );
    const first = slides[0];
    if (!first) return;

    const targetIndex =
      direction === 'left'
        ? Math.max(0, activeIndex - 1)
        : Math.min(Math.max(0, slideCount - 1), activeIndex + 1);
    const target = slides[targetIndex];
    if (!target) return;

    rail.scrollTo({
      left: Math.max(0, target.offsetLeft - first.offsetLeft),
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border bg-card">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-muted/60" />

      <div className="relative p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 flex size-11 items-center justify-center rounded-2xl border bg-background/80 shadow-sm backdrop-blur">
              <ListChecks className="size-5" />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Personal planning
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Your shopping plans, preserved.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              These plans live in your dashboard. A list reaches the public Store only after you share it and an administrator approves it.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Stat>{lists.length} {lists.length === 1 ? 'list' : 'lists'}</Stat>
              <Stat>{totalItems} {totalItems === 1 ? 'product' : 'products'}</Stat>
              <Stat>{totalQuantity} {totalQuantity === 1 ? 'planned item' : 'planned items'}</Stat>
              {totalValue > 0 ? <Stat>{formatCurrency(totalValue)}</Stat> : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              onClick={() => scroll('left')}
              disabled={!canPrevious}
              className="grid size-10 place-items-center rounded-xl border bg-background shadow-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Previous shopping lists">
              <ArrowLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              disabled={!canNext}
              className="grid size-10 place-items-center rounded-xl border bg-background shadow-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Next shopping lists">
              <ArrowRight className="size-4" />
            </button>
            <Link
              href="/account/lists"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border bg-background px-4 text-sm font-medium shadow-sm transition hover:bg-muted">
              View all
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/account/lists?create=true"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90">
              <Plus className="size-4" />
              Create list
            </Link>
          </div>
        </div>

        <div
          ref={railRef}
          className="relative mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2 scrollbar-hide">
          {lists.map(list => (
            <div key={list.id} data-shopping-list-slide className="snap-start">
              <ShoppingListPreviewCard list={list} />
            </div>
          ))}

          <Link
            href="/account/lists?create=true"
            data-shopping-list-slide
            className="group flex min-h-[30rem] w-[19rem] shrink-0 snap-start flex-col items-center justify-center rounded-2xl border border-dashed bg-background/45 p-6 text-center transition hover:border-foreground/30 hover:bg-background/70 sm:w-[20rem]">
            <div className="flex size-12 items-center justify-center rounded-2xl border bg-background shadow-sm transition group-hover:scale-105">
              {lists.length > 0 ? <Plus className="size-5" /> : <ListPlus className="size-5" />}
            </div>
            <h3 className="mt-4 font-semibold">Create a new list</h3>
            <p className="mt-2 max-w-48 text-sm leading-5 text-muted-foreground">
              Build a plan around an event, mood, budget or shopping purpose.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Stat({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-full border bg-background/70 px-3 py-1.5 text-xs font-medium backdrop-blur">
      {children}
    </div>
  );
}
