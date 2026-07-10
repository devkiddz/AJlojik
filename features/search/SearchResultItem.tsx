'use client';

import Image from 'next/image';
import { ArrowUpRight, Package } from 'lucide-react';
import { ProductType } from '@/types';
import { cn } from '@/lib/utils';

type Props = {
  product: ProductType;
  query: string;
  active?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
};

function highlight(text: string, query: string) {
  if (!query) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');

  return text.split(regex).map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="rounded bg-secondary/20 px-0.5 text-primary">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function SearchResultItem({ product, query, active, onMouseEnter, onClick }: Props) {
  const variant = product.variants[0];

  return (
    <button
      type="button"
      onMouseEnter={onMouseEnter}
      onClick={e => {
        e.stopPropagation(); // 🚀 Stops the click from bubbling out to the backdrop!
        onClick?.(); // Executes the raw callback without needing event arguments
      }}
      className={cn(
        'group flex w-full items-center gap-4 px-4 py-3 text-left transition-all duration-200',
        'hover:bg-muted/70',
        active && 'bg-muted'
      )}>
      {/* IMAGE */}
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
        <Image
          src={variant.image}
          alt={product.name}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      {/* CONTENT */}
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-semibold">{highlight(product.name, query)}</h4>

        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
          {highlight(product.shortDescription, query)}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-bold text-primary">₦{variant.price.toLocaleString()}</span>

          <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[11px] font-medium text-secondary">
            {product.category}
          </span>

          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Package className="h-3 w-3" />
            {variant.label}
          </span>
        </div>
      </div>

      {/* ARROW */}
      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100" />
    </button>
  );
}
