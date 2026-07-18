'use client';

import { useRef, type ReactNode } from 'react';

import {
  Award,
  ChevronLeft,
  ChevronRight,
  House,
  Package,
  Settings,
  ShoppingBag,
  Sparkles
} from 'lucide-react';

import { cn } from '@/lib/utils';

import { DiscoveryHubRenderer } from './DiscoveryHubRenderer';
import { useDiscoveryHub } from '@/providers/DiscoveryHubProvider';

import type { HubGroupIcon, HubGroupId } from './discoveryHubTypes';

type DiscoveryHubPanelProps = {
  className?: string;
  children?: ReactNode;

  onGroupSelect?: (groupId: HubGroupId) => void;
};

const hubGroupIcons = {
  home: House,
  shopping: ShoppingBag,
  orders: Package,
  rewards: Award,
  ai: Sparkles,
  settings: Settings
} satisfies Record<HubGroupIcon, typeof House>;

export default function DiscoveryHubPanel({ className, children, onGroupSelect }: DiscoveryHubPanelProps) {
  const { groups, activeGroupId, setActiveGroupId } = useDiscoveryHub();

  const tabsRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: 'left' | 'right') => {
    tabsRef.current?.scrollBy({
      left: direction === 'left' ? -160 : 160,

      behavior: 'smooth'
    });
  };

  const handleGroupSelect = (groupId: HubGroupId) => {
    /*
     * Always emit the navigation event.
     *
     * This works even when the clicked group is
     * already active, which is important while
     * the Product Details panel is visible.
     */
    onGroupSelect?.(groupId);

    /*
     * Keep the Discovery Hub provider synchronized.
     */
    setActiveGroupId(groupId);
  };

  return (
    <main className={cn('flex h-full min-h-0 w-full flex-col overflow-hidden bg-background', className)}>
      {/* Permanent Discovery Hub navigator */}

      <div className="relative z-40 shrink-0 border-b border-primary/10 bg-background/95 backdrop-blur-xl">
        <div className="px-5 pb-4 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/50">
            AJ Logik Workspace
          </p>

          <h2 className="mt-1 text-xl font-bold tracking-tight text-primary">Discovery Hub</h2>

          <p className="mt-1 pr-10 text-sm text-primary/55">
            Your personalized shopping and activity workspace.
          </p>
        </div>

        <div className="border-t border-primary/10 px-3 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              title="Scroll groups left"
              aria-label="Scroll groups left"
              onClick={() => scrollTabs('left')}
              className="grid size-8 shrink-0 place-items-center rounded-full bg-background/5 text-primary/60 transition hover:bg-card/10 hover:text-primary">
              <ChevronLeft className="size-4" />
            </button>

            <div
              ref={tabsRef}
              className="flex min-w-0 flex-1 gap-2 overflow-x-auto scroll-smooth scrollbar-none">
              {groups.map(group => {
                const Icon = hubGroupIcons[group.icon];

                const isActive = activeGroupId === group.id;

                return (
                  <button
                    key={group.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => handleGroupSelect(group.id)}
                    className={cn(
                      'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm transition-all',

                      isActive
                        ? 'bg-card font-semibold text-primary'
                        : 'bg-background/5 text-primary/60 hover:bg-card/10 hover:text-primary'
                    )}>
                    <Icon className="size-4" />

                    <span>{group.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              title="Scroll groups right"
              aria-label="Scroll groups right"
              onClick={() => scrollTabs('right')}
              className="grid size-8 shrink-0 place-items-center rounded-full bg-background/5 text-primary/60 transition hover:bg-background/10 hover:text-primary">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Single content viewport */}

      <div className="min-h-0 flex-1 overflow-hidden">
        {children ?? (
          <div className="h-full overflow-x-hidden overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable]">
            <div className="w-full p-3 pb-24 md:p-4">
              <DiscoveryHubRenderer />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
