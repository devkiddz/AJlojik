'use client';

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

export default function HeroCarousel() {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()]);

  return (
    //<section className="h-[40vh] md:h-[60vh] w-full ">
    <div className="embla mx-auto h-84 bg-muted rounded-md overflow-hidden">
      <div className="embla__viewpor h-full" ref={emblaRef}>
        <div className="embla__container">
          <div className="embla__slide flex items-center justify-center">Slide 1</div>
          <div className="embla__slide flex items-center justify-center">Slide 2</div>
          <div className="embla__slide flex items-center justify-center">Slide 3</div>
        </div>
      </div>

      <button className="embla__prev">Scroll to prev</button>
      <button className="embla__next">Scroll to next</button>
    </div>
    // </section>
  );
}
