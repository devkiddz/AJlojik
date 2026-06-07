'use client';

import Image from 'next/image';
import { useState } from 'react';
import { CategoryType } from '../Categories';

type CategoryCardProps = {
  category: CategoryType;
  index?: number;
};

export default function CategoryCard({ category }: CategoryCardProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  return (
    <div
      onMouseMove={e => {
        const rect = e.currentTarget.getBoundingClientRect();

        setPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }}
      className="
        group
        relative
        w-full
        h-32
        md:h-52
        rounded-2xl
        overflow-hidden
        border
        border-white/10
        bg-black
        cursor-pointer
        transition-all
        duration-300

        group-hover:scale-[1.03]
        hover:-translate-y-1
        hover:shadow-[0_0_40px_rgba(255,255,255,0.08)]
      ">
      {/* IMAGE */}
      <Image
        src={category.image}
        alt={category.name}
        fill
        className="
          object-cover
          transition-transform
          duration-500
          group-hover:scale-110
        "
      />

      {/* DARK OVERLAY */}
      <div
        className="
            absolute inset-0
            opacity-0
            group-hover:opacity-100
            transition
            duration-300
            pointer-events-none
            bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_60%)]
        "
      />

      {/* MOUSE GLOW */}
      <div
        className="
          absolute
          inset-0
          opacity-0
          group-hover:opacity-100
          transition-opacity
          duration-300
          pointer-events-none
        "
        style={{
          background: `radial-gradient(
            300px circle at ${position.x}px ${position.y}px,
            rgba(255,255,255,0.18),
            transparent 60%
          )`
        }}
      />

      {/* CONTENT */}
      <div className="absolute bottom-4 left-4 z-10">
        <h3 className="text-white font-semibold text-sm">{category.name}</h3>

        <p className="text-white/70 text-xs">{category.type}</p>
      </div>

      {/* TOP SHINE (optional polish) */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent" />
    </div>
  );
}
