'use client';

import { cn } from '@/lib/utils';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DiscoveryHubRenderer } from './DiscoveryHubRenderer';
import { useDiscoveryHub } from './DiscoveryHubProvider';
// import {discoveryHubTypes} from './discoveryHubTypes'

export default function DiscoveryHubPanel() {
  const { groups, activeGroupId, setActiveGroupId } = useDiscoveryHub();
  const tabsRef = useRef<HTMLDivElement>(null);
  //  const Icon = groups.label;

  const scrollTabs = (direction: 'left' | 'right') => {
    tabsRef.current?.scrollBy({
      left: direction === 'left' ? -160 : 160,
      behavior: 'smooth'
    });
  };

  return (
    <main className="flex max-h-[calc(100vh-5rem)] flex-col overflow-hidden rounded-3xl border border-primary/10 bg-background/90 scrollbar-none">
      {/* Header */}
      <div className="border-b border-primary/10 p-5">
        <h2 className="text-lg font-semibold text-primary">Discovery Hub</h2>

        <p className="mt-1 text-sm text-primary/55">Your personalized workspace.</p>
      </div>

      {/* Groups */}
      <div className="border-b border-primary/10 px-3 py-3">
        <div className="flex items-center gap-2">
          <button
            title="left"
            onClick={() => scrollTabs('left')}
            className="grid size-8 shrink-0 place-items-center rounded-full bg-background/5 text-primary/60 transition hover:bg-card/10 hover:text-primary">
            <ChevronLeft className="size-4" />
          </button>

          <div ref={tabsRef} className="flex flex-1 gap-2 overflow-x-auto scroll-smooth scrollbar-none">
            {groups.map(group => {
              const Icon = group.icon;

              return (
                <button
                  key={group.id}
                  onClick={() => setActiveGroupId(group.id)}
                  className={cn(
                    'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm transition-all',
                    activeGroupId === group.id
                      ? 'bg-card font-semibold text-primary'
                      : 'bg-background/5 text-primary/60 hover:bg-card/10 hover:text-primary'
                  )}>
                  <Icon className="size-4 " />
                  <span>{group.label}</span>
                </button>
              );
            })}
          </div>

          <button
            title="right"
            onClick={() => scrollTabs('right')}
            className="grid size-8 shrink-0 place-items-center rounded-full bg-background/5 text-primary/60 transition hover:bg-background/10 hover:text-primary">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Widgets */}
      <div className="flex-1 overflow-y-auto p-4">
        <DiscoveryHubRenderer />
      </div>
    </main>
  );
}
