'use client';

import React from 'react';
import { useScrollSpy } from './shared/useScrollSpy';
import CategoryPanel from './CategoryPanel';
import HeroCarousel from './HeroCarousel';
import ProductGrid from './shared/ProductsCards';
import SideCards from './SideCards';
//import AsideCategories from './AsideChategories';

export default function HeroCategoryGrid() {
  const active = useScrollSpy(['featured', 'deals', 'liquors', 'kitchen']);
  return (
    <div className="w-full grid grid-cols-12 gap-2 min-h-screen px-4">
      {/* LEFT PANEL */}
      <aside className="hidden md:block md:col-span-1 lg:col-span-1 sticky top-0 h-screen overflow-hidden">
        <CategoryPanel active={active} />
      </aside>

      {/* CAROUSEL + PRODUCTS */}
      <section className="col-span-12 md:col-span-10 lg:col-span-8">
        <HeroCarousel />

        <div className="mt-6">
          <ProductGrid />
        </div>
      </section>

      {/* RIGHT PANEL */}
      <aside className="hidden lg:block lg:col-span-3 sticky top-0 h-screen overflow-hidden">
        <SideCards />
      </aside>
    </div>
  );
}
