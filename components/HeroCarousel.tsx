'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import image1 from '@/public/assets/image-8.jpg';
import image2 from '@/public/assets/image-9.jpg';
import image3 from '@/public/assets/image-10.jpg';
import image4 from '@/public/assets/image-11.jpg';

const slides = [
  {
    id: 1,
    image: image1,
    badge: 'AJ Liqz',
    title: 'Premium Wines Collection',
    description: 'Discover exclusive wines and beverages.'
  },
  {
    id: 2,
    image: image2,
    badge: 'AJ Kitchen',
    title: 'Kitchen Essentials',
    description: 'Everything you need for your kitchen.'
  },
  {
    id: 3,
    image: image3,
    badge: 'Party Plans',
    title: 'Celebrate Without Stress',
    description: 'Packages and solutions for every event.'
  },
  {
    id: 4,
    image: image4,
    badge: 'AJ Store',
    title: 'Featured Deals',
    description: 'Explore trending products and discounts.'
  }
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent(prev => (prev + 1) % slides.length);
  };

  useEffect(() => {
    const timer = setTimeout(nextSlide, 5000);
    return () => clearTimeout(timer);
  }, [current]);

  return (
    <section className="relative overflow-hidden rounded-md">
      <div className="relative min-h-50 aspect-16/8 md:min-h-80">
        {/* Slides */}
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${current * 100}%)`
          }}>
          {slides.map(slide => (
            <div key={slide.id} className="relative min-w-full">
              <Image src={slide.image} alt={slide.title} fill className="object-cover scale-105" />

              {/* <div className="absolute inset-0 bg-black/45" /> */}

              <div className="absolute -top-3 md:top-0 inset-0 flex items-center">
                <div className="max-w-xl px-8 md:px-16 text-white">
                  <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs md:text-xs backdrop-blur-3xl">
                    {slide.badge}
                  </span>

                  <h1 className="mt-1 md:mt-4 text-lg font-bold md:text-5xl shadow-2xl text-white">
                    {slide.title}
                  </h1>

                  <p className="text-sm md:text-base md:mt-2 text-white font-bold">{slide.description}</p>

                  <div className="relative top-1 md:top-4 flex gap-3">
                    <button className="rounded-full bg-secondary px-5 py-2 text-xs md:text-sm text-white cursor-pointer">
                      Shop Now
                    </button>

                    <button className="rounded-full border border-white/30 px-5 py-2 text-sm bg-card/20 backdrop-blur-3xl transition-all cursor-pointer hover:bg-card/50">
                      View Deals
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bootstrap-style Controls */}
        <div className="hover:flex relative bottom-40 md:bottom-80 w-100">
          <button
            aria-label="slide left"
            type="button"
            onClick={prevSlide}
            className="absolute left-0 top-0 z-20 flex h-full w-10 md:w-16 items-center justify-center bg-gradient-to-r from-black/30 to-transparent">
            <ChevronLeft className="h-8 w-8 text-white cursor-pointer" />
          </button>

          <button
            aria-label="slide right"
            type="button"
            onClick={nextSlide}
            className="absolute -right-25 md:-right-215 top-0 z-20 flex h-full w-16 items-center justify-center bg-gradient-to-l from-black to-transparent">
            <ChevronRight className="h-8 w-8 text-white cursor-pointer" />
          </button>
        </div>
        {/* Indicators */}
        <div className="absolute left-1/3 bottom-5 md:left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              aria-label="slider index"
              type="button"
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-2 rounded-full transition-all ${
                current === index ? 'w-3 bg-white' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
      {/* <div className="absolute inset-0 bg-black/20" /> */}

      {/* <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background/20" /> */}
    </section>
  );
}
