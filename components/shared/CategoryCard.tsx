'use client';

import Image from 'next/image';
import { categoryType } from '@/types';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

type CategoryCardProps = {
  category: categoryType;
};

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <article className="group relative w-95 hover:w-107 sm:w-95 h-35 shrink-0 rounded-lg md:rounded-2xl border border-primary/10 transition-all duration-300 overflow-hidden">
      <div className="flex h-full items-center gap-4 p-4">
        {/* Image */}
        <div className="relative h-25 w-35 sm:h-30 sm:w-39 shrink-0 overflow-hidden rounded-xl">
          <Image
            src={category.image}
            alt={category.label}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="truncate text-base font-semibold text-primary sm:text-lg">{category.label}</h3>

          <p className="mt-1 line-clamp-2 text-xs text-primary sm:text-sm">
            {category.subcategories?.length
              ? category.subcategories
                  .slice(0, 3)
                  .map(sub => sub.label)
                  .join(', ')
              : 'Explore products'}
          </p>

          <div className="flex items-center justify-between mt-auto pt-3">
            <span className="rounded-full bg-rose-500/10 px-2 py-1 text-xs font-medium text-rose-400">
              {category.subcategories?.length ?? 0} items
            </span>

            {/* VIEW BUTTON (hover reveal) */}
            <Link
              href="/shop"
              aria-label="view category"
              className="
                flex items-center gap-1
                rounded-full bg-white-500/10 px-4 py-1
                text-xs font-medium text-white-400
                border
                border-white-500
                md:opacity-0 
                transition-all duration-300
                group-hover:opacity-100 group-hover:translate-y-0
                hover:bg-rose-600 hover:text-primary
                hover:border-rose-500
                cursor-pointer
              ">
              Explore
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
