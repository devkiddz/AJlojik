'use client';

import Image from 'next/image';

type Banner = {
  title: string;
  image?: string;
};

type Props = {
  banner: Banner;
  title: string;
};

/**
 * A Collection cover is intentionally presentation-only.
 * Collection title, product count and navigation live in the
 * Collection products header beneath this panoramic artwork.
 */
export default function CollectionBanner({ banner, title }: Props) {
  if (!banner.image) {
    return null;
  }

  return (
    <div
      className="relative aspect-[9/2] w-full overflow-hidden bg-muted"
      data-collection-cover>
      <Image
        src={banner.image}
        alt={`${title} collection cover`}
        fill
        priority={false}
        sizes="(max-width: 768px) 100vw, 1200px"
        className="object-cover object-center"
      />
    </div>
  );
}
