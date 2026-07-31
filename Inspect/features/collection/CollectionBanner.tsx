'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { ArrowRight } from 'lucide-react';

type Banner = {
  title: string;
  image?: string;
  href?: string;
};

type Props = {
  banner: Banner;
  title: string;
  count: number;
};

export default function CollectionBanner({ banner, title, count }: Props) {
  if (!banner?.image) return null;

  const content = (
    <div className="group premium-card relative overflow-hidden">
      <div className="relative h-40 w-full overflow-hidden md:h-64 xl:h-72">
        <Image
          src={banner.image}
          alt={banner.title}
          fill
          priority={false}
          sizes="(max-width:768px) 100vw, 1200px"
          className="object-cover transition-all duration-700 group-hover:brightness-110"
        />

        <div className="pointer-events-none absolute inset-0 rounded-[1.35rem] ring-1 ring-muted-background" />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/5 opacity-70" />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/35 p-4 backdrop-blur-xl md:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <h2 className="truncate text-sm font-bold tracking-tight text-white md:text-2xl">{title}</h2>

          <div className="hidden shrink-0 rounded-full bg-accent backdrop-blur-3xl p-2  text-xs font-bold text-accent-foreground sm:block">
            <span className="text-white"> Avalable</span>{' '}
            <span className="ml-1 shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-accent shadow-md">
              {count}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 rounded-full text-xs md:text-lg">
            View Collection
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
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
