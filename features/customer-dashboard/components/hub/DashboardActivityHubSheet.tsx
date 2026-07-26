'use client';

import { X } from 'lucide-react';

import type {
  CustomerDashboardView
} from '../../view/resolveCustomerDashboardView';
import { DashboardAIControl } from '../ai/DashboardAIControl';
import { DashboardActivityHub } from './DashboardActivityHub';

type DashboardActivityHubSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  view: CustomerDashboardView;
};

export function DashboardActivityHubSheet({
  open,
  onOpenChange,
  view
}: DashboardActivityHubSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] xl:hidden">
      <button
        type="button"
        aria-label="Close Activity Hub"
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
      />

      <aside className="absolute inset-y-0 right-0 w-[min(92vw,24rem)] overflow-y-auto border-l border-border/60 bg-background p-3 shadow-2xl">
        <header className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-bold">
            Dashboard Hub
          </p>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="grid size-9 place-items-center rounded-xl border border-border/60 bg-card">
            <X className="size-4" />
          </button>
        </header>

        <div className="space-y-3">
          <DashboardActivityHub view={view} />
          <DashboardAIControl />
        </div>
      </aside>
    </div>
  );
}
