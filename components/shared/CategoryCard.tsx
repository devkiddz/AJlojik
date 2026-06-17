'use client';

import Image from 'next/image';
import { CategoryType } from '@/types';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

type CategoryCardProps = {
  category: CategoryType;
};

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <article className="group relative w-85 hover:w-87 sm:w-85 h-30 shrink-0 rounded-2xl border border-white/10 bg-zinc-900 transition-all duration-300 hover:border-rose-500/40 hover:bg-zinc-800 overflow-hidden">
      <div className="flex h-full items-center gap-4 p-4">
        {/* Image */}
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-xl">
          <Image
            src={category.image}
            alt={category.label}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="truncate text-base font-semibold text-white sm:text-lg">{category.label}</h3>

          <p className="mt-1 line-clamp-2 text-xs text-white/60 sm:text-sm">
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
              aria-label="view Category"
              className="
                flex items-center gap-1
                rounded-full bg-white-500/10 px-4 py-1
                text-xs font-medium text-white-400
                border
                border-white-500
                md:opacity-0 
                transition-all duration-300
                group-hover:opacity-100 group-hover:translate-y-0
                hover:bg-rose-600 hover:text-white
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
