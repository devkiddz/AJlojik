'use client';

import { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import CategoryCard from './CategoryCard';
import { categoryType } from '@/types/types';

type Props = {
  categories: categoryType[];
};

export default function CategoriesCarousel({ categories }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

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
