// 'use client';

// import { useRef } from 'react';
// import { useInView } from './shared/useInView';
import Image from 'next/image';
import image from '@/public/assets/Image-8.jpg';

export default function HeroCarousel() {
  // const ref = useRef(null);
  // const isVisible = useInView(ref);

  return (
    <section className="relative aspect-5/3 lg:aspect-3/1 cover">
      <Image
        src={image}
        alt="Picture of the author"
        placeholder="blur" // Optional: gives a smooth blur-up effect while loading
        fill
        className="w-full h-auto object-cover object-center"
      />
    </section>
  );
}
