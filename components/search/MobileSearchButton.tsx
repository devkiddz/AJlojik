'use client';

import { Search } from 'lucide-react';

import { useSearch } from '@/components/providers/SearchProvider';

export default function MobileSearchButton() {
  const { setOpen } = useSearch();

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="
        flex
        h-11
        w-full
        items-center
        gap-3

        rounded-full
        border
        bg-background

        px-4

        text-sm
        text-muted-foreground

        shadow-sm

        transition
        hover:bg-muted/40

        lg:hidden
      ">
      <Search className="h-4 w-4 shrink-0" />

      <span className="truncate">Search products...</span>
    </button>
  );
}
