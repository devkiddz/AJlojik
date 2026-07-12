'use client';

import { Search } from 'lucide-react';
import { useSearch } from '@/providers/SearchProvider';

export default function MobileSearchButton() {
  const { setOpen } = useSearch();

  return (
    <button
      type="button"
      onClick={e => {
        e.stopPropagation(); // 🚀 Isolate the modal opening trigger
        setOpen(true);
      }}
      aria-label="Open search"
      className="flex h-12 w-full items-center justify-between rounded-2xl border border-border/60 bg-background px-4 shadow-sm transition-all duration-200 active:scale-[0.98] lg:hidden">
      <div className="flex items-center gap-3">
        <Search className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Search products, wines...</span>
      </div>

      <kbd className="rounded-md bg-muted px-2 py-1 text-[10px] text-muted-foreground">Tap</kbd>
    </button>
  );
}
