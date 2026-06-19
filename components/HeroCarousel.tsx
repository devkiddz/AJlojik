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
    description: 'Discover exclusive wines, spirits, and curated beverage selections.'
  },
  {
    id: 2,
    image: image2,
    badge: 'AJ Kitchen',
    title: 'Everything For Your Kitchen',
    description: 'Quality ingredients and kitchen essentials delivered to your doorstep.'
  },
  {
    id: 3,
    image: image3,
    badge: 'Party Plans',
    title: 'Celebrate Without Stress',
    description: 'Packages and event solutions for birthdays, weddings, and corporate events.'
  },
  {
    id: 4,
    image: image4,
    badge: 'AJ Store',
    title: 'Featured Deals & Discounts',
    description: 'Explore trending products and limited-time offers across all categories.'
  }
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent(prev => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      nextSlide();
    }, 5000);

    return () => clearTimeout(timer);
  }, [current]);

  return (
    <section className="relative overflow-hidden rounded-2xl mb-2">
      <div className="relative aspect-[16/8] min-h-[300px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-out ${
              current === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}>
            {/* Background Image */}
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={index === 0}
              className={`object-cover transition-transform duration-[6000ms] ease-linear ${
                current === index ? 'scale-105' : 'scale-100'
              }`}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/45" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div
                className={`max-w-xl px-8 md:px-16 text-white transition-all duration-1000 ${
                  current === index ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}>
                <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  {slide.badge}
                </span>

                <h1 className="mt-4 text-3xl font-bold md:text-5xl">{slide.title}</h1>

                <p className="mt-3 max-w-lg text-sm text-white/90 md:text-base">{slide.description}</p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button className="rounded-full bg-rose-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-rose-600">
                    Shop Now
                  </button>

                  <button className="rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20">
                    View Deals
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Bootstrap-style Previous Control */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-0 top-0 z-20 flex h-full w-16 items-center justify-center from-black/30 to-transparent transition hover:from-black/50">
          <ChevronLeft className="h-8 w-8 text-white" />
        </button>

        {/* Bootstrap-style Next Control */}
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-0 top-0 z-20 flex h-full w-16 items-center justify-center bg-gradient-to-l from-black/30 to-transparent transition hover:from-black/50">
          <ChevronRight className="h-8 w-8 text-white" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setCurrent(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                current === index ? 'w-10 bg-white' : 'w-6 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
