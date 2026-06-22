'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Mocking the category schema matching your e-commerce structure
const featuredCategories = [
  {
    id: 'cat_kitchen',
    slug: 'kitchen',
    name: 'Kitchen Logik',
    desc: 'Professional-grade culinary appliances and kitchen essentials.',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
    size: 'large',
    accent: 'bg-orange-500'
  },
  {
    id: 'cat_wines',
    slug: 'wines',
    name: 'AJ Vinez',
    desc: 'Premium wines & luxury champagnes.',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
    size: 'small',
    accent: 'bg-rose-500'
  },
  {
    id: 'cat_party',
    slug: 'party-plans',
    name: 'Party Plans',
    desc: 'Live catering & complete event hosting setup.',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80',
    size: 'small',
    accent: 'bg-purple-500'
  }
];

export default function FeaturedCategoriesGrid() {
  // Isolating the layout structures dynamically
  const mainHero = featuredCategories.find(c => c.size === 'large');
  const subPairs = featuredCategories.filter(c => c.size === 'small');

  return (
    <section className="w-full px-1">
      {/* Main Grid Wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 relative aspect-5/2 rounded-md bg-muted">
        {/* LEFT SIDE: Big Hero (Kitchen Logik) */}
        {mainHero && (
          <div className="group relative lg:col-span-12 flex flex-col justify-end w-full h-40 md:h-105 rounded-md overflow-hidden cursor-pointer">
            <div className="absolute inset-0 z-0">
              <Image
                fill
                src={mainHero.image}
                alt={mainHero.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent" />
            </div>

            <div className="relative z-10 p-6 transition-transform duration-200 group-hover:translate-x-1">
              <span className="text-[10px] font-bold tracking-wider uppercase text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-md border border-orange-500/20">
                Flagship Store
              </span>
              <h3 className="text-xl font-bold text-white mt-3 tracking-tight">{mainHero.name}</h3>
              <p className="text-xs text-neutral-300 mt-1 max-w-md line-clamp-2 opacity-90">
                {mainHero.desc}
              </p>
            </div>

            {/* Fluent Active Line Indicator */}
            {/* <div
            // className={`absolute bottom-0 left-0 w-full h-[3px] ${mainHero.accent} scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100`}
            /> */}
          </div>
        )}

        {/* RIGHT SIDE: Sub-grid holding the two next to each other */}
        <div className="lg:col-span-12 grid grid-cols-2 sm:grid-cols-2 gap-1 bg-transparent">
          {subPairs.map(card => (
            <div
              key={card.id}
              // whileHover={{ y: -2 }}
              className="group relative flex flex-col justify-end w-full h-40 md:h-45 lg:h-full rounded-md overflow-hidden shadow-sm cursor-pointer">
              <div className="absolute inset-0 z-0">
                <Image
                  fill
                  src={card.image}
                  alt={card.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
              </div>

              <div className="relative z-10 p-4 transition-transform duration-300 group-hover:translate-x-1">
                <h3 className="text-sm font-semibold text-white tracking-tight">{card.name}</h3>
                <p className="text-[11px] text-neutral-300 mt-1 line-clamp-2 opacity-85 leading-normal">
                  {card.desc}
                </p>
              </div>

              {/* Fluent Active Line Indicator */}
              {/* <div
                className={`absolute bottom-0 left-0 w-full h-[3px] ${card.accent} scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100`}
              /> */}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
