import React from 'react';
import ImageLight from '@/public/assets/Image-1.png';
import ImageDark from '@/public/assets/Image-2.png';
import HeroCategoryGrid from './HeroCategoryGrid';

export default function HeroComponent() {
  return (
    <section className="relative w-full flex">
      {/* BACKGROUND LAYER */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-500 dark:opacity-0"
        style={{
          backgroundImage: `url(${ImageLight.src})`
        }}
      />

      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-500 opacity-0 dark:opacity-100"
        style={{
          backgroundImage: `url(${ImageDark.src})`
        }}
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/30 dark:bg-black/60" />

      {/* CONTENT */}
      <div className="relative w-full flex flex-col items-center justify-center pt-1">
        <HeroCategoryGrid />
      </div>
    </section>
  );
}
