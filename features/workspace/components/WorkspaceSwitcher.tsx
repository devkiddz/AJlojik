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
    'group flex items-center border text-left',
    'transition duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
    'disabled:cursor-not-allowed disabled:opacity-60',

    variant === 'compact' && [
      'h-10 gap-2 rounded-full',
      'bg-background/80 px-2 shadow-sm backdrop-blur-xl',
      'hover:border-primary/20 hover:bg-primary/5'
    ],

    variant === 'account-sheet' && [
      'w-full gap-3 rounded-2xl p-3',
      'border-border/70 bg-gradient-to-br from-card via-card to-muted/40',
      'shadow-sm hover:border-primary/20 hover:shadow-md'
    ],

    variant === 'sidebar' && [
      'w-full gap-3 rounded-xl p-2.5',
      'border-sidebar-border/70 bg-sidebar-accent/40',
      'hover:border-primary/20 hover:bg-sidebar-accent'
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
        {/* Experience icon */}
        <span
          className={cn(
            'relative grid shrink-0 place-items-center rounded-xl border',
            'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',

            variant === 'compact' ? 'size-7' : 'size-10'
          )}>
          <span className="absolute inset-0 rounded-xl bg-emerald-400/5 opacity-0 transition-opacity group-hover:opacity-100" />

          {switchingWorkspace ? (
            <LoaderCircle className="relative size-4 animate-spin" />
          ) : (
            <span className="relative">
              <WorkspaceModeIcon mode={activeWorkspace.mode} />
            </span>
          )}
        </span>

        {/* Experience details */}
        <span className="min-w-0 flex-1">
          {variant !== 'compact' && (
            <span className="block text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Current experience
            </span>
          )}

          <span
            className={cn(
              'block truncate font-semibold',
              variant === 'compact' ? 'text-xs tracking-wide' : 'mt-0.5 text-sm'
            )}>
            {activeWorkspace.mode}
          </span>

          {variant !== 'compact' && (
            <span className="mt-1 block truncate text-xs text-muted-foreground">
              {wallet ?? workspaceDescriptions[activeWorkspace.mode]}
            </span>
          )}

          {variant === 'compact' && wallet && (
            <span className="hidden text-xs text-muted-foreground sm:inline">{wallet}</span>
          )}
        </span>

        {/* Caret control box */}
        <span
          className={cn(
            'grid shrink-0 place-items-center border',
            'bg-background/60 text-muted-foreground shadow-sm',
            'transition duration-200',
            'group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-foreground',

            variant === 'compact' ? 'size-7 rounded-lg' : 'size-9 rounded-xl'
          )}>
          <ChevronDown className={cn('size-4 transition-transform duration-200', open && 'rotate-180')} />
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute mt-2 overflow-hidden rounded-2xl border',
            'border-border/70 bg-popover/95 shadow-2xl backdrop-blur-xl',
            'animate-in fade-in-0 zoom-in-95 duration-150',

            variant === 'compact' && ['right-0', 'w-[min(22rem,calc(100vw-1.5rem))]'],

            variant === 'account-sheet' && ['left-0 right-0', 'w-full'],

            variant === 'sidebar' && [
              'bottom-[calc(100%+0.5rem)] left-0',
              'w-[min(21rem,calc(100vw-1.5rem))]'
            ]
          )}>
          {/* Menu header */}
          <div className="flex items-start justify-between border-b border-border/60 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Choose experience</p>

              <p className="mt-1 text-xs text-muted-foreground">Switch between Live, Demo and Practice.</p>
            </div>

            <button
              type="button"
              aria-label="Close experience switcher"
              onClick={() => setOpen(false)}
              className={cn(
                'grid size-8 place-items-center rounded-xl border',
                'bg-background/50 text-muted-foreground',
                'transition hover:border-primary/20 hover:bg-primary/5 hover:text-foreground'
              )}>
              <X className="size-4" />
            </button>
          </div>

          {/* Workspace options */}
          <div className="space-y-1.5 p-2">
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
                    'group/item flex w-full items-start gap-3 rounded-xl border border-transparent p-3 text-left',
                    'transition duration-200',
                    'hover:border-primary/10 hover:bg-primary/5',
                    'disabled:cursor-not-allowed disabled:opacity-50',

                    selected && [
                      'border-primary/15 bg-primary/10',
                      'shadow-[inset_3px_0_0_hsl(var(--primary))]'
                    ]
                  )}>
                  <span
                    className={cn(
                      'mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border',
                      'bg-background/60 text-muted-foreground transition',

                      selected
                        ? 'border-primary/20 bg-primary/10 text-primary'
                        : 'border-border/70 group-hover/item:border-primary/15 group-hover/item:text-foreground'
                    )}>
                    <WorkspaceModeIcon mode={workspace.mode} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{workspace.mode}</span>

                      {selected && (
                        <span className="grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-3" />
                        </span>
                      )}
                    </span>

                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                      {workspaceDescriptions[workspace.mode]}
                    </span>

                    {workspaceWallet && (
                      <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-2 py-1 text-xs font-medium">
                        <WalletCards className="size-3.5 text-primary" />

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
