'use client';

import { useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type categorySidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function categorySidebar({ open, onClose }: categorySidebarProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity duration-300',
          open ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
      />

      {/* SIDEBAR */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-lg bg-white transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full'
        )}>
        {/* HEADER */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Categories</h2>

          <button
            onClick={onClose}
            aria-label="Open categories menu"
            className="flex items-center gap-2 rounded-full bg-background-foreground/50 px-3 py-2 shadow-sm hover:bg-background-foreground/70 transition">
            <Menu size={18} />
            <span className="text-sm font-medium">Categories</span>
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-4 space-y-3 bg-muted h-screen">
          <button className="w-full text-left hover:text-secondary">Wines</button>
          <button className="w-full text-left hover:text-secondary">Whiskey</button>
          <button className="w-full text-left hover:text-secondary">Champagne</button>
          <button className="w-full text-left hover:text-secondary">Beers</button>
          <button className="w-full text-left hover:text-secondary">Spirits</button>
        </div>
      </aside>
    </>
  );
}
