// app/products/[id]/loading.tsx
import React from 'react';

export default function ProductPageLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12 animate-pulse">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 items-start">
        {/* Image Box Placeholder */}
        <div className="aspect-square w-full rounded-2xl bg-zinc-900" />
        {/* Text Block Placeholders */}
        <div className="space-y-6 py-4">
          <div className="h-8 w-3/4 rounded-lg bg-zinc-900" />
          <div className="h-4 w-1/2 rounded-lg bg-zinc-900" />
          <div className="h-12 w-1/3 rounded-lg bg-zinc-900" />
          <div className="h-24 w-full rounded-lg bg-zinc-900" />
        </div>
      </div>
    </div>
  );
}
