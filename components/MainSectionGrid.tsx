'use client';

import React from 'react';
import HeroCarousel from './HeroCarousel';
import SideCards from './SideCards';
import ProductsComponent from './shared/ProductsComponent';

export default function MainSectionGrid() {
  return (
    <div className="w-full">
      {/* 1. HERO CAROUSEL (Left Feature Area) */}
      <section className="w-full grid grid-cols-12 gap-1 -mt-15 bg-primary  shadow-yellow-800 shadow-2xl">
        <section className="col-span-12 md:col-span-8">
          <HeroCarousel />
        </section>

        {/* 2. SIDE PANEL (Right Editorial Cards) */}
        {/* Making this sticky keeps it tracked with the viewport while scrolling down */}
        <aside className="col-span-12 md:col-span-4 md:top-4 h-fit space-y-4">
          <SideCards />
        </aside>
      </section>

      {/* 3. PRODUCTS GRID (Spans Full Width Below Both) */}
      <section className="col-span-12 mb-6 mt-2 md:px-4">
        <ProductsComponent />
      </section>
    </div>
  );
}
