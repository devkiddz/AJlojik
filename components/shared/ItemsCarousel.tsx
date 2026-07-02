'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import CategoryCard from './CategoryCard';
import { categoryType } from '@/types';

type Props = {
  categories: categoryType[];
};

export default function CategoriesCarousel({ categories }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const [progress, setProgress] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  const calculateMetrics = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const max = el.scrollWidth - el.clientWidth;
    setMaxScroll(max > 0 ? max : 0);
  }, []);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const max = el.scrollWidth - el.clientWidth;

    if (max <= 0) {
      setProgress(0);
      return;
    }

    setProgress((el.scrollLeft / max) * 100);
  }, []);

  // Hook into native wheel event to override passive browser scrolling defaults
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleNativeWheel = (e: WheelEvent) => {
      // Locks browser window vertical scrolling
      e.preventDefault();
      // Scrolls the carousel row horizontally instead
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener('wheel', handleNativeWheel, { passive: false });

    return () => {
      el.removeEventListener('wheel', handleNativeWheel);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;

    el.scrollBy({
      left: direction === 'left' ? -400 : 400,
      behavior: 'smooth'
    });
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    const track = trackRef.current;
    if (!el || !track || maxScroll === 0) return;

    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    const ratio = Math.min(Math.max(clickX / rect.width, 0), 1);
    const target = ratio * maxScroll;

    el.scrollTo({
      left: target,
      behavior: 'smooth'
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;

    isDragging.current = true;
    startX.current = e.pageX;
    scrollLeft.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;

    if (!el || !isDragging.current) return;

    e.preventDefault();

    const walk = (e.pageX - startX.current) * 1.2;

    el.scrollLeft = scrollLeft.current - walk;
  };

  const stopDragging = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    calculateMetrics();

    const handleResize = () => calculateMetrics();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [categories, calculateMetrics]);

  return (
    <section className="relative bg-muted p-4 rounded-sm md:rounded-2xl">
      {/* Header Controls */}
      <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
        <Button variant="ghost">
          <h1 className="md:text-lg text-primary">Trending Categories</h1>
          <ChevronRight />
        </Button>

        <div className="flex items-center gap-2">
          <Button size="icon" variant="secondary" onClick={() => scroll('left')} className="rounded-full">
            <ChevronLeft />
          </Button>

          <Button size="icon" variant="secondary" onClick={() => scroll('right')} className="rounded-full">
            <ChevronRight />
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        className="flex gap-4 overflow-x-hidden scroll-smooth pb-2 cursor-grab select-none active:cursor-grabbing [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
        {categories.map(category => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      {/* Progress Tracker */}
      {/* <div
        ref={trackRef}
        onClick={handleTrackClick}
        className="mt-4 h-2 w-full rounded-full bg-zinc-800 cursor-pointer relative">
        <div
          className="h-full rounded-full bg-secondary transition-all duration-150"
          style={{
            width: `${progress}%`
          }}
        />
      </div> */}
    </section>
  );
}
