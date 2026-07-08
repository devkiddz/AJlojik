'use client';

import React from 'react';
import HeroCarousel from './HeroCarousel';
import SideCards from './SideCards';
import ProductsComponent from './shared/ProductsComponent';

export default function MainSectionGrid() {
  return (
    <div className="w-full bg-background/90 backdrop-blur-3xl p-2">
      {/* 1. HERO CAROUSEL (Left Feature Area) */}
      <section className="w-full grid grid-cols-12 gap-1">
        <section className="col-span-12 md:col-span-8">
          {/* <div className="absolute inset-0 bg-rose/30" /> */}
          {/* <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" /> */}
          <HeroCarousel />
        </section>

        {/* 2. SIDE PANEL (Right Editorial Cards) */}
        {/* Making this sticky keeps it tracked with the viewport while scrolling down */}
        <aside className="col-span-12 md:col-span-4 space-y-4">
          <SideCards />
        </aside>
      </section>

      {/* 3. PRODUCTS GRID (Spans Full Width Below Both) */}
      <section className="col-span-12 mb-6 mt-2 md:p-2">
        <ProductsComponent />
      </section>
    </div>
  );
}
