'use client';

import React from 'react';
// import HeroCarousel from '@/components/HeroCarousel';

import StoreAside from '@/components/store/StoreAside';
import StoreCategoriesPill from '@/components/store/StoreCategoriesPill';
import StoreCategoryCard from '@/components/store/StoreCategoryCard';
import StoreRightPannel from '@/components/store/StoreRightPannel';
import { categories } from '@/categories';
import { products } from '@/data/products';
import StoreFeaturedProductCard from '@/components/store/StoreFeaturedProductCard';
import ProductsComponent from '@/components/shared/ProductsComponent';
import StoreFeaturedProductsSlide from '@/components/store/StoreFeaturedProductsSlide';

export default function AJStorePage() {
  const featuredProducts = products.filter(product => product.featured);

  const featuredProduct = featuredProducts.length
    ? featuredProducts[Math.floor(Math.random() * featuredProducts.length)]
    : products[0];

  return (
    <div className="mx-auto px-4 py-4 -mt-5">
      <div className="grid min-h-screen grid-cols-12 gap-4">
        {/* LEFT */}
        <aside className="hidden md:block col-span-12 lg:col-span-2">
          <StoreAside />
        </aside>

        {/* MAIN */}
        <main className="col-span-12 lg:col-span-8">
          <div className="bg-transparent">
            {/* <HeroCarousel /> */}

            {/* CATEGORY SECTION */}
            <section className="gap-4 rounded-md bg-transparent">
              <div className="sticky top-14 z-5 py-5 px-4 items-center rounded-md bg-muted">
                <StoreCategoriesPill />
              </div>

              {/* CLEAN GRID (NO EXTRA WRAPPER COMPONENT) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-3 gap-2  pt-10 -mt-5">
                {categories.map(category => (
                  <StoreCategoryCard key={category.id} category={category} />
                ))}
              </div>
            </section>

            {/* FEATURED */}
            <section className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <StoreFeaturedProductCard product={featuredProduct} />
              </div>

              <div className="lg:col-span-3">
                {/* Carousel comes next */}
                <section className="col-span-5 mb-6">
                  <StoreFeaturedProductsSlide products={featuredProducts} />
                </section>
              </div>
            </section>

            {/* PRODUCTS */}
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 ">
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
