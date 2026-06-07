'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CategoryCard from './CategoryCard';
import { CategoryType } from '../Categories';
import { Button } from '../ui/button';

type Props = {
  categories: CategoryType[];
};

export default function CategoriesCarousel({ categories }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const looped = [...categories, ...categories, ...categories];

  // 🖱 drag start
  const onMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  // 🖱 drag move
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    e.preventDefault();

    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.2;

    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const stopDrag = () => setIsDragging(false);

  // ⬅️➡️ arrows
  const scroll = (dir: 'left' | 'right') => {
    if (!containerRef.current) return;

    containerRef.current.scrollBy({
      left: dir === 'left' ? -300 : 300,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative group overflow-x-auto">
      {/* LEFT ARROW */}
      <Button
        onClick={() => scroll('left')}
        className="
          hidden md:flex
          absolute left-0 top-1/2 -translate-y-1/2
          z-10
          bg-black/50
          text-white
          p-2
          rounded-full
          opacity-0 group-hover:opacity-100
          transition
        ">
        <ChevronLeft />
      </Button>

      {/* RIGHT ARROW */}
      <Button
        onClick={() => scroll('right')}
        className="
          hidden md:flex
          absolute right-0 top-1/2 -translate-y-1/2
          z-10
          bg-black/50
          text-white
          p-2
          rounded-full
          opacity-0 group-hover:opacity-100
          transition
        ">
        <ChevronRight />
      </Button>

      {/* SCROLL AREA */}
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        className="
          flex
          gap-4
          overflow-x-auto
          scroll-smooth
          px-2
          py-4
          cursor-grab
          active:cursor-grabbing
          snap-x
          snap-mandatory
          scrollbar-hide
        ">
        {looped.map((category, index) => (
          <div key={`${category.id}-${index}`} className="min-w-55">
            <CategoryCard category={category} />
          </div>
        ))}
      </div>
    </div>
  );
}
