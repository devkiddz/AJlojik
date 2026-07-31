import type { ReactNode } from 'react';

type WorkspaceShellProps = {
  children: ReactNode;
};

/**
 * Generic content shell retained for feature-level composition.
 *
 * The single customer Discovery Hub now belongs to ApplicationShell,
 * preventing individual pages from mounting competing sidebars.
 */
export default function WorkspaceShell({ children }: WorkspaceShellProps) {
  return <div className="min-w-0 flex-1">{children}</div>;
}
