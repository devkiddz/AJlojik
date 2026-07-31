'use client';

import { Clock3, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  history: string[];
  onSelect: (value: string) => void;
  onRemove: (query: string) => void;
  onClear: () => void;
};

export default function SearchHistory({ history, onSelect, onRemove, onClear }: Props) {
  if (!history.length) return null;

  return (
    <section className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Clock3 className="h-4 w-4 text-muted-foreground" />
          Recent Searches
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={e => {
            e.stopPropagation(); // 🚀 Blocks global overlay collapse on clear all
            onClear();
          }}
          className="h-7 px-2 text-xs">
          Clear
        </Button>
      </div>

      {/* Search Chips */}
      <div className="flex flex-wrap gap-2">
        {history.map(item => (
          <div
            key={item}
            className="group flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-xs transition hover:border-secondary hover:bg-muted">
            <button
              type="button"
              onClick={e => {
                e.stopPropagation(); // 🚀 Prevent backdrop closing during select
                onSelect(item);
              }}
              className="cursor-pointer">
              {item}
            </button>

            <button
              aria-label="Remove search"
              type="button"
              onClick={e => {
                e.stopPropagation(); // 🚀 Crucial! Stops the chip click from bubbling out and closing the search modal
                onRemove(item);
              }}
              className="rounded-full p-0.5 opacity-50 transition hover:bg-card/10 hover:text-card hover:opacity-100">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
