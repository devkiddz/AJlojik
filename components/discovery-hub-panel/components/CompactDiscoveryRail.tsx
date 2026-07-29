'use client';

import { ExperienceNavigationControls } from '@/features/experience-stack/ExperienceNavigationControls';

import type { CompactDiscoveryItem } from '../discoveryHubTypes';

import CompactDiscoveryCard from './CompactDiscoveryCard';

type CompactDiscoveryRailProps = {
  items: CompactDiscoveryItem[];
  onExpand: () => void;
  onSelectItem: (item: CompactDiscoveryItem) => void;
};

export default function CompactDiscoveryRail({ items, onExpand, onSelectItem }: CompactDiscoveryRailProps) {
  return (
    <section
      className="
        flex h-full min-h-0
        flex-col
        rounded-3xl
        border border-primary/10
        bg-card/60
        p-3
        backdrop-blur
      ">
      {/* Fixed header */}

      <div className="mb-4 flex shrink-0 items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Discovery
          </p>

          <h3 className="truncate text-sm font-semibold text-foreground">Quick Experiences</h3>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ExperienceNavigationControls compact />

          <button
            type="button"
            onClick={onExpand}
            className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-semibold transition hover:bg-background">
            Open
          </button>
        </div>
      </div>

      {/* Scrollable discoveries */}

      <div
        className="
          min-h-0 flex-1
          space-y-2
          overflow-x-hidden
          overflow-y-auto
          overscroll-y-contain
          pr-1
          scrollbar-none
        ">
        {items.map(item => (
          <CompactDiscoveryCard key={item.id} item={item} onClick={() => onSelectItem(item)} />
        ))}
      </div>

      {/* Fixed lower action */}

      <button
        type="button"
        onClick={onExpand}
        className="
          mt-3 w-full shrink-0
          rounded-2xl
          border border-border
          bg-background/70
          px-4 py-3
          text-xs font-semibold
          transition
          hover:bg-background
        ">
        Open Discovery Hub
      </button>
    </section>
  );
}
