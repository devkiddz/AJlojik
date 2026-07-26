'use client';

import { Activity } from 'lucide-react';

type DashboardActivityHubTriggerProps = {
  onClick: () => void;
};

export function DashboardActivityHubTrigger({
  onClick
}: DashboardActivityHubTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open Activity Tracking Hub"
      className="fixed bottom-5 right-4 z-40 grid size-12 place-items-center rounded-full border border-white/10 bg-slate-950 text-white shadow-xl xl:hidden">
      <Activity className="size-5" />
    </button>
  );
}
