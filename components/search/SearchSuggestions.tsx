'use client';

import { ProductType } from '@/types';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';

type Props = {
  products: ProductType[];
  query: string;
  activeIndex: number;
  onSelect: (product: ProductType) => void;
};

export default function SearchSuggestions({ products, query, activeIndex, onSelect }: Props) {
  // High-fidelity matching text helper
  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-primary/10 text-primary font-semibold rounded-xs px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      <h4 className="px-2 text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest">
        Products ({products.length})
      </h4>

      <div className="space-y-1">
        {products.map((product, index) => {
          const isActive = index === activeIndex;
          const firstVariant = product.variants?.[0];

          return (
            <div
              key={product.id}
              onClick={() => onSelect(product)}
              className={cn(
                'flex items-center justify-between gap-4 rounded-xl p-2.5 transition-all duration-200 cursor-pointer select-none group active:scale-[0.99]',
                isActive ? 'bg-secondary text-secondary-foreground shadow-xs' : 'hover:bg-muted/50'
              )}>
              {/* Left Column: Image + Info */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-muted-foreground/10 shadow-2xs">
                  {firstVariant?.image ? (
                    <img
                      src={firstVariant.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-sm">📦</span>
                  )}
                </div>

                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-bold tracking-tight truncate group-hover:text-primary transition-colors">
                    {highlightText(product.name, query)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate leading-normal">
                    {product.shortDescription}
                  </p>
                </div>
              </div>

              {/* Right Column: Dynamic Price Tag */}
              <div className="flex items-center gap-1.5 shrink-0 pl-2">
                {firstVariant?.price && (
                  <span className="text-sm font-black tracking-tight text-foreground">
                    ₦{firstVariant.price.toLocaleString()}
                  </span>
                )}
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/30 transition-transform duration-200 group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
