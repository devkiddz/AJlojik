'use client';

import { ProductType } from '@/types';
import { Sparkles, Package, Info } from 'lucide-react';

export default function ProductDetailsPanel({ product }: { product: ProductType }) {
  return (
    <div className="space-y-6">
      {/* 1. Description Block */}
      <div className="premium-card p-6 rounded-2xl">
        <h3 className="text-sm font-black text-foreground mb-3 flex items-center gap-2">
          <Info className="h-4 w-4 text-accent" />
          Product Narrative
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed font-medium">{product.longDescription}</p>
      </div>

      {/* 2. Specs/Tags Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="premium-card p-5 rounded-2xl">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-3">
            Category
          </h4>
          <span className="text-sm font-bold text-foreground capitalize">
            {product.category.replace('-', ' ')}
          </span>
        </div>

        <div className="premium-card p-5 rounded-2xl">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-3">
            Merchandise Tags
          </h4>
          <div className="flex flex-wrap gap-2">
            {product.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-muted text-[10px] font-bold rounded-md border border-border">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Authenticity Badge */}
      <div className="flex items-center gap-4 p-4 border border-accent/20 bg-accent/5 rounded-xl">
        <Sparkles className="h-8 w-8 text-accent" />
        <div>
          <h4 className="text-xs font-black text-foreground">Verified Premium Quality</h4>
          <p className="text-[10px] text-muted-foreground">
            This item is guaranteed authentic and has passed our luxury inspection process.
          </p>
        </div>
      </div>
    </div>
  );
}
