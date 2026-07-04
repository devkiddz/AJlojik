'use client';

import Image from 'next/image';
import Link from 'next/link';

type Banner = {
  title: string;
  image?: string;
  href?: string;
};

type Props = {
  banner: Banner;
};

export default function CollectionBanner({ banner }: Props) {
  if (!banner?.image) return null;

  const content = (
    <div className="group premium-card relative overflow-hidden rounded-3xl p-1.5">
      <div className="relative h-40 w-full overflow-hidden rounded-[1.35rem] md:h-64 xl:h-72">
        <Image
          src={banner.image}
          alt={banner.title}
          fill
          priority={false}
          sizes="(max-width:768px) 100vw, 1200px"
          className="object-cover transition-all duration-700 group-hover:scale-[1.025] group-hover:brightness-110"
        />

        <div className="pointer-events-none absolute inset-0 rounded-[1.35rem] ring-1 ring-white/10" />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/5 opacity-70" />
      </div>
    </div>
  );

  return banner.href ? (
    <Link href={banner.href} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}
