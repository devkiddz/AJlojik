'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';

import type { categoryType } from '@/types/types';

type StoreCategoryCardProps = {
  category: categoryType;
  active?: boolean;
  onClick?: () => void;
};

export default function StoreCategoryCard({ category, active = false, onClick }: StoreCategoryCardProps) {
  return (
    <button
      type="button"
      aria-label={`Open ${category.label}`}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'group relative flex h-14 w-full min-w-0 items-center overflow-hidden rounded-lg border text-left backdrop-blur-xl transition duration-200 sm:h-16',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_30px_rgba(0,0,0,0.16)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        active
          ? 'border-primary/35 bg-primary/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_12px_35px_rgba(0,0,0,0.2)]'
          : 'border-white/10 bg-background/35 hover:border-primary/25 hover:bg-background/50'
      )}>
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-r transition',
          active
            ? 'from-primary/20 via-primary/10 to-transparent'
            : 'from-white/5 via-transparent to-transparent'
        )}
      />

      <div className="pointer-events-none absolute -right-8 -top-8 size-20 rounded-full bg-primary/10 blur-2xl transition group-hover:bg-primary/15" />

      <div className="relative h-full aspect-square shrink-0 overflow-hidden border-r border-white/10 bg-muted/40">
        <Image
          src={category.image}
          alt=""
          fill
          sizes="64px"
          className="object-cover transition duration-300 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/15" />
      </div>

      <div className="relative min-w-0 flex-1 px-3">
        <p
          className={cn(
            'truncate text-xs font-semibold tracking-tight sm:text-sm',
            active ? 'text-primary' : 'text-primary/85 group-hover:text-primary'
          )}>
          {category.label}
        </p>
      </div>

      {active ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-3 right-2 w-1 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.65)]"
        />
      ) : null}
    </button>
  );
}
