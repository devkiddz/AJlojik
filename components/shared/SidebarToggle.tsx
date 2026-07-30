'use client';

import {
  Menu,
  PanelLeftClose
} from 'lucide-react';

import { useSidebar } from '@/components/ui/sidebar';

export default function SidebarToggle() {
  const { open, toggleSidebar } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      title={open ? 'Collapse navigation' : 'Open navigation'}
      aria-label={open ? 'Collapse navigation' : 'Open navigation'}
      className="grid size-10 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-background/55 text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-accent/25 hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60">
      {open ? <PanelLeftClose className="size-[1.15rem]" /> : <Menu className="size-[1.15rem]" />}
    </button>
  );
}
