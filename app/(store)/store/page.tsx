'use client';

import React from 'react';
import HeroCarousel from '@/components/HeroCarousel';
import StoreAside from '@/components/store/StoreAside';
import StoreCategoriesPill from '@/components/store/StoreCategoriesPill';
import StoreCategoryCard from '@/components/store/StoreCategoryCard';
import StoreRightPannel from '@/components/store/StoreRightPannel';
import StoreFeatureds from '@/components/store/StoreFeatureds';
import { categories } from '@/categories';

export default function AJStorePage() {
  return (
    <div className="mx-auto px-4 py-4">
      <div className="grid min-h-screen grid-cols-12 gap-4">
        {/* LEFT */}
        <aside className="col-span-12 lg:col-span-2">
          <StoreAside />
        </aside>

        {/* MAIN */}
        <main className="col-span-12 lg:col-span-8">
          <div className="">
            {/* <HeroCarousel /> */}

            {/* CATEGORY SECTION */}
            <section className="space-y-4 relative">
              <div className="sticky py-5 px-4 items-center top-15 z-5 bg-muted">
                <StoreCategoriesPill />
              </div>

              {/* CLEAN GRID (NO EXTRA WRAPPER COMPONENT) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map(category => (
                  <StoreCategoryCard key={category.id} category={category} />
                ))}
              </div>
            </section>

            {/* FEATURED */}
            <section className="flex items-center justify-between">
              <StoreFeatureds />
            </section>

            {/* PRODUCTS */}
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {/* products */}
            </section>
          </div>
        </main>

        {/* RIGHT */}
        <aside className="col-span-12 lg:col-span-2">
          <StoreRightPannel />
        </aside>
      </div>
    </div>
  );
}
