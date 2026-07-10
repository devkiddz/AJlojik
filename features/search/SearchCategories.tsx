'use client';

import { UtensilsCrossed, Wine, PartyPopper, ArrowRight } from 'lucide-react';
import { categories } from '@/data/categories';

type Props = {
  onSelect: (category: string) => void;
};

const icons = {
  kitchen: UtensilsCrossed,
  wines: Wine,
  'party-plans': PartyPopper
};

export default function SearchCategories({ onSelect }: Props) {
  if (!categories.length) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Browse Categories</h3>

      <div className="space-y-2">
        {categories.map(category => {
          const Icon = icons[category.slug as keyof typeof icons] ?? UtensilsCrossed;

          return (
            <button
              key={category.id}
              type="button"
              onClick={e => {
                e.stopPropagation(); // 🚀 Blocks the backdrop from auto-collapsing
                onSelect(category.slug);
              }}
              className="group flex w-full items-center gap-3 rounded-xl border border-transparent bg-muted/40 px-3 py-3 transition-all duration-300 hover:border-secondary/20 hover:bg-secondary/5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex-1 text-left">
                <p className="font-medium">{category.label}</p>
                <p className="text-xs text-muted-foreground">Browse products</p>
              </div>

              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
