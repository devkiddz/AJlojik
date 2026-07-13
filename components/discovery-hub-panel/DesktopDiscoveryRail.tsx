'use client';

import { ChevronLeft, ChevronRight, Heart, PackageCheck, ShoppingCart, Sparkles, Star } from 'lucide-react';

import { cn } from '@/lib/utils';

import DiscoveryHubPanel from './DiscoveryHubPanel';
import { DiscoveryHubProvider } from './DiscoveryHubProvider';
import type { HubGroup, HubWidget } from './discoveryHubTypes';

type DesktopDiscoveryRailProps = {
  groups: HubGroup[];
  widgets: HubWidget[];

  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
};

const compactItems = [
  {
    id: 'cart',
    label: 'Cart',
    value: '3',
    icon: ShoppingCart
  },
  {
    id: 'wishlist',
    label: 'Saved',
    value: '4',
    icon: Heart
  },
  {
    id: 'delivery',
    label: 'ETA',
    value: '18m',
    icon: PackageCheck
  },
  {
    id: 'rewards',
    label: 'Points',
    value: '2.5k',
    icon: Star
  }
];

export default function DesktopDiscoveryRail({
  groups,
  widgets,
  collapsed,
  onCollapsedChange
}: DesktopDiscoveryRailProps) {
  return (
    <aside
      className={cn(
        'sticky top-0 hidden max-h-[calc(100vh-5rem)] self-start overflow-hidden transition-all duration-300 lg:block',
        collapsed ? 'lg:col-span-2' : 'lg:col-span-4'
      )}>
      {collapsed ? (
        <section className="flex min-h-[calc(100vh-5rem)] flex-col rounded-3xl border border-primary/10 bg-card/60 p-3 shadow-sm backdrop-blur">
          {/* Compact Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </div>

            <button
              type="button"
              onClick={() => onCollapsedChange(false)}
              aria-label="Expand Discovery Hub"
              className="grid size-9 place-items-center rounded-full border border-border bg-background/70 text-muted-foreground transition hover:text-foreground">
              <ChevronLeft className="size-4" />
            </button>
          </div>

          {/* Identity */}
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Discovery</p>

            <h3 className="mt-1 text-sm font-semibold text-foreground">Your activity</h3>
          </div>

          {/* Live Compact Widgets */}
          <div className="mt-5 space-y-2">
            {compactItems.map(item => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onCollapsedChange(false)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-background/60 p-3 text-left transition hover:border-primary/20 hover:bg-background">
                  <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                    <Icon className="size-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">{item.label}</p>

                    <p className="text-sm font-semibold text-foreground">{item.value}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* AI Pulse */}
          <button
            type="button"
            onClick={() => onCollapsedChange(false)}
            className="mt-3 flex items-center gap-3 rounded-2xl border border-violet-500/15 bg-violet-500/[0.06] p-3 text-left transition hover:bg-violet-500/[0.1]">
            <span className="relative grid size-9 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-500">
              <Sparkles className="size-4" />

              <span className="absolute right-0 top-0 size-2 rounded-full bg-emerald-400 ring-2 ring-card" />
            </span>

            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">AJ AI</p>

              <p className="line-clamp-1 text-xs font-semibold text-foreground">New suggestion</p>
            </div>
          </button>

          {/* Footer */}
          <button
            type="button"
            onClick={() => onCollapsedChange(false)}
            className="mt-auto flex items-center justify-center gap-2 rounded-2xl border border-border bg-background/70 px-3 py-3 text-xs font-semibold text-foreground transition hover:bg-background">
            Open Hub
            <ChevronLeft className="size-4" />
          </button>
        </section>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => onCollapsedChange(true)}
            aria-label="Collapse Discovery Hub"
            className="absolute right-3 top-3 z-20 grid size-9 place-items-center rounded-full border border-border bg-background/85 text-muted-foreground shadow-sm backdrop-blur transition hover:text-foreground">
            <ChevronRight className="size-4" />
          </button>

          <DiscoveryHubProvider groups={groups} widgets={widgets}>
            <DiscoveryHubPanel />
          </DiscoveryHubProvider>
        </div>
      )}
    </aside>
  );
}
