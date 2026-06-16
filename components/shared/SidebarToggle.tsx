'use client';

import { useSidebar } from '@/components/ui/sidebar';
import { Menu, PanelLeftClose } from 'lucide-react';

export default function SidebarToggle() {
  const { open, toggleSidebar } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className="p-2 rounded-md hover:bg-muted transition"
      aria-label="Toggle Sidebar">
      {open ? <PanelLeftClose className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </button>
  );
}
