'use client';

import Image from 'next/image';
import Link from 'next/link';

import { BannerType } from '@/data/collections';

type Props = {
  banners: BannerType[];
};

export default function CollectionBanner({ banners }: Props) {
  if (!banners.length) return null;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {banners.map(banner => {
        const content = (
          <div className="relative aspect-[16/6] overflow-hidden rounded-xl">
            <Image src={banner.image} alt={banner.alt} fill className="object-cover" />
          </div>
        );

        return banner.href ? (
          <Link key={banner.id} href={banner.href}>
            {content}
          </Link>
        ) : (
          <div key={banner.id}>{content}</div>
        );
      })}
    </div>
  );
}
