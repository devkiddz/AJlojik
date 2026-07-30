'use client';

import {
  Clock3,
  Globe2,
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
  ShieldX
} from 'lucide-react';
import type { MouseEvent } from 'react';

import { cn } from '@/lib/utils';

import { useShoppingLists } from '../client';
import type { ShoppingList } from '../shoppingListTypes';

type ShoppingListPublicationToggleProps = {
  list: ShoppingList;
  compact?: boolean;
  className?: string;
};

function resolvePresentation(list: ShoppingList) {
  switch (list.publicationStatus) {
    case 'PENDING_REVIEW':
      return {
        label: 'In review',
        helper: 'Click to withdraw',
        icon: Clock3,
        action: 'WITHDRAW' as const,
        active: true,
        className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
      };
    case 'APPROVED':
      return {
        label: 'Public',
        helper: 'Approved for Store',
        icon: Globe2,
        action: 'WITHDRAW' as const,
        active: true,
        className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
      };
    case 'REJECTED':
      return {
        label: 'Resubmit',
        helper: list.publicationReviewNote ?? 'Not approved',
        icon: RotateCcw,
        action: 'SUBMIT' as const,
        active: false,
        className: 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
      };
    default:
      return {
        label: 'Private',
        helper: 'Share for approval',
        icon: LockKeyhole,
        action: 'SUBMIT' as const,
        active: false,
        className: 'border-border/70 bg-background text-muted-foreground'
      };
  }
}

export function ShoppingListPublicationToggle({
  list,
  compact = false,
  className
}: ShoppingListPublicationToggleProps) {
  const { setPublication, mutating } = useShoppingLists();
  const presentation = resolvePresentation(list);
  const Icon = presentation.icon;
  const cannotSubmit = presentation.action === 'SUBMIT' && list.itemCount === 0;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (mutating || cannotSubmit) return;

    void setPublication(list.id, presentation.action).catch(() => undefined);
  };

  return (
    <button
      type="button"
      aria-pressed={presentation.active}
      aria-label={
        presentation.action === 'SUBMIT'
          ? `Share ${list.name} publicly for administrator approval`
          : `Make ${list.name} private`
      }
      title={cannotSubmit ? 'Add at least one product before sharing this list.' : presentation.helper}
      disabled={mutating || cannotSubmit}
      onClick={handleClick}
      className={cn(
        'inline-flex min-w-0 items-center rounded-full border font-semibold transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50',
        compact ? 'h-8 gap-1.5 px-2.5 text-[11px]' : 'h-10 gap-2 px-3 text-xs',
        presentation.className,
        className
      )}>
      {mutating ? <LoaderCircle className="size-3.5 shrink-0 animate-spin" /> : <Icon className="size-3.5 shrink-0" />}
      <span className="truncate">{presentation.label}</span>
      <span
        aria-hidden="true"
        className={cn(
          'relative ml-0.5 inline-flex shrink-0 rounded-full border border-current/20 bg-current/10 transition',
          compact ? 'h-4 w-7' : 'h-5 w-9'
        )}>
        <span
          className={cn(
            'absolute top-1/2 -translate-y-1/2 rounded-full bg-current shadow-sm transition-all',
            compact ? 'size-2.5' : 'size-3',
            presentation.active ? (compact ? 'left-3.5' : 'left-5') : 'left-0.5'
          )}
        />
      </span>
    </button>
  );
}

export function ShoppingListPublicationStatusIcon({ list }: { list: ShoppingList }) {
  if (list.publicationStatus === 'APPROVED') return <Globe2 className="size-3.5" />;
  if (list.publicationStatus === 'PENDING_REVIEW') return <Clock3 className="size-3.5" />;
  if (list.publicationStatus === 'REJECTED') return <ShieldX className="size-3.5" />;
  return <LockKeyhole className="size-3.5" />;
}
