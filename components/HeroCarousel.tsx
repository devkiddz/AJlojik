'use client';

import { useRef } from 'react';
import { useInView } from './shared/useInView';
import Image from 'next/image';
import image from '@/public/assets/Image-6.jpg';

export default function HeroCarousel() {
  const ref = useRef(null);
  // const isVisible = useInView(ref);

  return (
    <section ref={ref} className="h-[50vh] md:h-[80vh] w-full bg-muted rounded-md">
      <Image
        src={image}
        alt="Picture of the author"
        placeholder="blur" // Optional: gives a smooth blur-up effect while loading
        width={1200}
        height={600}
        className="w-full h-auto object-cover object-center"
      />
    </section>
  );
}
