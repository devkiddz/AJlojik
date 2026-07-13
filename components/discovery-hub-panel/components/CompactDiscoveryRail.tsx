'use client';

import type { CompactDiscoveryItem } from '../discoveryHubTypes';

import CompactDiscoveryCard from './CompactDiscoveryCard';

type CompactDiscoveryRailProps = {
  items: CompactDiscoveryItem[];
  onExpand: () => void;
  onSelectItem: (item: CompactDiscoveryItem) => void;
};

export default function CompactDiscoveryRail({ items, onExpand, onSelectItem }: CompactDiscoveryRailProps) {
  return (
    <section className="flex min-h-[calc(100vh-5rem)] flex-col rounded-3xl border border-primary/10 bg-card/60 p-3 backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Discovery
          </p>

          <h3 className="truncate text-sm font-semibold text-foreground">Quick Experiences</h3>
        </div>

        <button
          type="button"
          onClick={onExpand}
          className="shrink-0 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-semibold">
          Open
        </button>
      </div>

      <div className="space-y-2">
        {items.map(item => (
          <CompactDiscoveryCard key={item.id} item={item} onClick={() => onSelectItem(item)} />
        ))}
      </div>

      <button
        type="button"
        onClick={onExpand}
        className="mt-auto w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-xs font-semibold">
        Open Discovery Hub
      </button>
    </section>
  );
}
