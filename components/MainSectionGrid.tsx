'use client';

import React from 'react';
import HeroCarousel from './HeroCarousel';
import SideCards from './SideCards';
import ProductsComponent from './shared/ProductsComponent';

export default function MainSectionGrid() {
  return (
    <div className="w-full grid grid-cols-12 gap-2 min-h-screen md:px-4 relative items-start">
      {/* LEFT PANEL: Swapped 'absolute top-0 h-screen' to 'sticky top-4 h-fit' */}

      {/* CAROUSEL + PRODUCTS */}
      <section className="col-span-12 md:col-span-9 ">
        <HeroCarousel />

        <div className="mt-6">
          <ProductsComponent />
        </div>
      </section>

      {/* RIGHT PANEL */}
      <aside className="hidden lg:block lg:col-span-3 sticky top-4 h-screen overflow-hidden">
        <SideCards />
      </aside>
    </div>
  );
}
