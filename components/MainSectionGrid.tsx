'use client';

import React from 'react';
import { useScrollSpy } from './shared/useScrollSpy';
import CategoryPanel from './CategoryPanel';
import HeroCarousel from './HeroCarousel';
import SideCards from './SideCards';
import ProductsComponent from './shared/ProductsComponent';
import { categories } from '@/categories';

const sectionIds = categories.map(c => c.slug);

export default function MainSectionGrid() {
  const active = useScrollSpy(sectionIds);

  return (
    <div className="w-full grid grid-cols-12 gap-2 min-h-screen md:px-4">
      {/* LEFT PANEL */}
      <aside className="absolute md:col-span-1 lg:col-span-1 top-0 h-screen overflow-hidden z-50 left-1">
        <CategoryPanel activeSlug={active} />
      </aside>

      {/* CAROUSEL + PRODUCTS */}
      <section className="col-span-12 md:col-span-9">
        <HeroCarousel />

        <div className="mt-6">
          <ProductsComponent />
        </div>
      </section>

      {/* RIGHT PANEL */}
      <aside className="hidden lg:block lg:col-span-3 sticky top-0 h-screen overflow-hidden">
        <SideCards />
      </aside>
    </div>
  );
}
