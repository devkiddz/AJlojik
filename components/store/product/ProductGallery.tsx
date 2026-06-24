'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type Props = {
  // FIXED: Explicitly expect an array of image strings
  images: string[];
  // FIXED: Let the gallery know what the active variant image is to sync up on variant change
  activeVariantImage?: string;
};

export default function ProductGallery({ images, activeVariantImage }: Props) {
  // FIXED: Fall back safely if images array is empty or undefined
  const [active, setActive] = useState<string>(activeVariantImage || images[0] || '');

  // SYNC: If the user changes variants in the sibling components, update the main frame
  useEffect(() => {
    if (activeVariantImage) {
      setActive(activeVariantImage);
    }
  }, [activeVariantImage]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-[420px] rounded-2xl bg-muted flex items-center justify-center text-zinc-500">
        No images available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image Viewport */}
      <div className="relative w-full h-[420px] rounded-2xl overflow-hidden bg-black/40 border border-white/5">
        <Image src={active} alt="Active product visualization" fill className="object-cover" priority />
      </div>

      {/* Thumbnails Selection Track */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {images.map((img, i) => (
          <button
            aria-label={`View product image ${i + 1}`}
            type="button"
            key={img + i}
            onClick={() => setActive(img)}
            className={`relative w-20 h-20 rounded-xl overflow-hidden border shrink-0 transition-all duration-200 cursor-pointer ${
              active === img
                ? 'border-rose-500 scale-105 shadow-md shadow-rose-500/10'
                : 'border-white/10 opacity-60 hover:opacity-100'
            }`}>
            <Image src={img} alt={`Thumbnail preview ${i + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
