'use client';

import type { ReactNode } from 'react';

import GlobalDiscoveryHost from '@/features/feed-experience/layout/GlobalDiscoveryHost';

type WorkspaceShellProps = {
  children: ReactNode;
};

export default function WorkspaceShell({ children }: WorkspaceShellProps) {
  return (
    <div
      className="
        min-w-0 flex-1
        lg:grid
        lg:grid-cols-[minmax(0,1fr)_auto]
        lg:items-start
      ">
      <div className="min-w-0">{children}</div>

      <GlobalDiscoveryHost />
    </div>
  );
}
