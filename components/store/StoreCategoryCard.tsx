'use client';

import Image from 'next/image';
import { CategoryType } from '@/types';

type Props = {
  category: CategoryType;
  active?: boolean;
  onClick?: () => void;
};

export default function StoreCategoryCard({ category, active, onClick }: Props) {
  return (
    <article
      onClick={onClick}
      className="group relative h-40 w-full cursor-pointer rounded-2xl border border-primary/10 overflow-hidden transition-all duration-300 hover:scale-[1.02]">
      <div className="flex h-full items-center gap-4 p-4">
        {/* IMAGE */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-24">
          <Image
            src={category.image}
            alt={category.label}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* CONTENT */}
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="truncate text-base font-semibold text-primary">{category.label}</h3>

          <p className="mt-1 line-clamp-2 text-xs text-primary/70">
            {category.subcategories?.length
              ? category.subcategories
                  .slice(0, 3)
                  .map(s => s.label)
                  .join(', ')
              : 'Explore products'}
          </p>

          <div className="mt-auto pt-2">
            <span className="rounded-full bg-rose-500/10 px-2 py-1 text-xs font-medium text-rose-400">
              {category.subcategories?.length ?? 0} items
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
