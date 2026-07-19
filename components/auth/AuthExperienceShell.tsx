'use client';

import { useState, type ReactNode } from 'react';

import StoreExperienceSidebar from '@/features/feed-experience/layout/StoreExperienceSidebar';
import { cn } from '@/lib/utils';

export default function AuthExperienceShell({ children }: { children: ReactNode }) {
  const [hubCollapsed, setHubCollapsed] = useState(false);

  return (
    <div className="grid min-h-[calc(100dvh-5rem)] grid-cols-12 items-stretch gap-4 px-3 py-4 sm:px-4">
      <main
        className={cn(
          'col-span-12 grid min-w-0 place-items-center rounded-[2rem] bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.09),transparent_36%)] px-3 py-7 transition-all duration-300 sm:px-5',
          hubCollapsed ? 'lg:col-span-10' : 'lg:col-span-8'
        )}>
        {children}
      </main>

      <StoreExperienceSidebar
        tier="guest"
        authenticated={false}
        collapsed={hubCollapsed}
        onCollapsedChange={setHubCollapsed}
      />
    </div>
  );
}
