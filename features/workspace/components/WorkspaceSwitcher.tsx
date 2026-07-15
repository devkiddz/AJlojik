'use client';

import { Check, ChevronDown, FlaskConical, LoaderCircle, Radio, WalletCards, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useWorkspace } from '../WorkspaceProvider';
import type { Workspace, WorkspaceMode } from '../workspaceTypes';

type WorkspaceSwitcherVariant = 'compact' | 'account-sheet' | 'sidebar';

type WorkspaceSwitcherProps = {
  variant?: WorkspaceSwitcherVariant;
  className?: string;
};

const workspaceDescriptions: Record<WorkspaceMode, string> = {
  LIVE: 'Shop with real products, orders and payments.',
  DEMO: 'Explore AJ Logik with synthetic commerce data.',
  PRACTICE: 'Practise shopping safely with paper money.',
  SANDBOX: 'Isolated environment for system testing.'
};

function WorkspaceModeIcon({ mode }: { mode: WorkspaceMode }) {
  switch (mode) {
    case 'LIVE':
      return <Radio className="size-4" />;
    case 'DEMO':
    case 'PRACTICE':
    case 'SANDBOX':
      return <FlaskConical className="size-4" />;
  }
}

function formatWallet(workspace: Workspace) {
  if (!workspace.wallet) return null;

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: workspace.wallet.currency,
    maximumFractionDigits: 0
  }).format(workspace.wallet.balance);
}

export function WorkspaceSwitcher({ variant = 'compact', className }: WorkspaceSwitcherProps) {
  const { activeWorkspace, availableWorkspaces, switchingWorkspace, switchWorkspace } = useWorkspace();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  if (!activeWorkspace || availableWorkspaces.length <= 1) {
    return null;
  }

  const wallet = formatWallet(activeWorkspace);

  const handleSwitch = async (workspaceId: string) => {
    if (workspaceId === activeWorkspace.id) {
      setOpen(false);
      return;
    }

    await switchWorkspace(workspaceId);
    setOpen(false);
  };

  const triggerClassName = cn(
    'flex items-center border transition',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:cursor-not-allowed disabled:opacity-60',

    variant === 'compact' && [
      'h-10 gap-2 rounded-full',
      'bg-background/80 px-3 shadow-sm backdrop-blur-xl',
      'hover:bg-primary/10 transition-all'
    ],

    variant === 'account-sheet' && [
      'w-full gap-3 rounded-2xl',
      'bg-muted/30 p-3 text-left',
      'hover:bg-muted/60'
    ],

    variant === 'sidebar' && [
      'w-full gap-3 rounded-xl',
      'bg-sidebar-primary/10 transition-all/40 p-2.5 text-left',
      'hover:bg-sidebar-primary/10 transition-all'
    ]
  );

  return (
    <div ref={containerRef} className={cn('relative z-50', variant !== 'compact' && 'w-full', className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={switchingWorkspace}
        onClick={() => setOpen(current => !current)}
        className={triggerClassName}>
        {/* Emerald Animated Icon Container */}
        <span
          className={cn(
            'grid shrink-0 place-items-center rounded-xl border animate-pulse',
            variant === 'compact' ? 'size-7' : 'size-10',
            'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
          )}>
          {switchingWorkspace ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <WorkspaceModeIcon mode={activeWorkspace.mode} />
          )}
        </span>

        <div className="flex flex-col gap-4">
          {/* Clean text without the pulse dot */}
          <span className="block truncate text-sm font-semibold pb-2 border-b border-primary">
            {activeWorkspace.mode}
          </span>
          <span className={cn('min-w-0 flex-1', variant === 'compact' && 'flex items-center gap-2')}>
            {variant !== 'compact' && (
              <span className="block text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Current experience
              </span>
            )}

            {variant !== 'compact' && (
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {wallet ?? workspaceDescriptions[activeWorkspace.mode]}
              </span>
            )}

            {variant === 'compact' && wallet && (
              <span className="hidden text-xs text-muted-foreground sm:inline">{wallet}</span>
            )}
          </span>
        </div>

        <ChevronDown
          className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute mt-2 overflow-hidden rounded-2xl border bg-popover shadow-xl',

            variant === 'compact' && ['right-0', 'w-[min(22rem,calc(100vw-1.5rem))]'],

            variant === 'account-sheet' && ['left-0 right-0', 'w-full'],

            variant === 'sidebar' && [
              'bottom-[calc(100%+0.5rem)] left-0',
              'w-[min(21rem,calc(100vw-1.5rem))]'
            ]
          )}>
          <div className="flex items-start justify-between border-b px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Choose experience</p>

              <p className="mt-1 text-xs text-muted-foreground">Switch between Live, Demo and Practice.</p>
            </div>

            <button
              type="button"
              aria-label="Close experience switcher"
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-muted-foreground transition hover:bg-card/80 hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-1 p-2">
            {availableWorkspaces.map(workspace => {
              const selected = workspace.id === activeWorkspace.id;
              const workspaceWallet = formatWallet(workspace);

              return (
                <button
                  key={workspace.id}
                  type="button"
                  role="menuitem"
                  disabled={switchingWorkspace || !workspace.active}
                  onClick={() => void handleSwitch(workspace.id)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl p-3 text-left transition',
                    'hover:bg-primary/10 transition-all disabled:cursor-not-allowed disabled:opacity-50',
                    selected && 'bg-primary/10 transition-all'
                  )}>
                  <span
                    className={cn(
                      'mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border',
                      selected && 'border-primary/10 transition-all bg-primary/10 text-primary'
                    )}>
                    <WorkspaceModeIcon mode={workspace.mode} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{workspace.mode}</span>

                      {selected && <Check className="size-4 text-primary" />}
                    </span>

                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                      {workspaceDescriptions[workspace.mode]}
                    </span>

                    {workspaceWallet && (
                      <span className="mt-2 flex items-center gap-1.5 text-xs font-medium">
                        <WalletCards className="size-3.5" />
                        {workspaceWallet}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
