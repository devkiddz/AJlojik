'use client';

import Image from 'next/image';
import { categoryType } from '@/types';
import { cn } from '@/lib/utils';

type Props = {
  category: categoryType;
  active?: boolean;
  onClick?: () => void;
};

export default function StoreCategoryCard({ category, active = false, onClick }: Props) {
  return (
    <article
      onClick={onClick}
      className={cn(
        'group relative h-12 md:h-30 w-full cursor-pointer overflow-hidden rounded-md border transition-all duration-300 hover:scale-[1.02]',
        active
          ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
          : 'border-primary/10 hover:border-primary/30'
      )}>
      <div className="flex h-full items-center gap-4 p-1 md:p-4">
        {/* IMAGE */}
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md md:h-20 md:w-20 md:rounded-xl">
          <Image
            src={category.image}
            alt={category.label}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* CONTENT */}
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h3
            className={cn(
              'truncate text-[0.8rem] font-semibold md:text-base',
              active ? 'text-primary' : 'text-primary/80'
            )}>
            {category.label}
          </h3>

          <p className="mt-1 hidden line-clamp-2 text-xs text-primary/70 md:block">
            {category.subcategories?.length
              ? category.subcategories
                  .slice(0, 3)
                  .map(sub => sub.label)
                  .join(', ')
              : 'Explore products'}
          </p>

          <div className="mt-auto pt-2">
            <span
              className={cn(
                'hidden rounded-full px-2 py-1 text-xs font-medium md:inline',
                active ? 'bg-secondary text-primary' : 'bg-secondary/10 text-rose-400'
              )}>
              {category.subcategories?.length ?? 0} items
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
