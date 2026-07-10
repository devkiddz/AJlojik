'use client';

import { CornerDownLeft, ArrowUp, ArrowDown } from 'lucide-react';

export default function SearchFooter() {
  return (
    <div className="flex items-center justify-between border-t bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <kbd className="rounded border px-2 py-1">↑</kbd>
        <kbd className="rounded border px-2 py-1">↓</kbd>
        Navigate
      </div>

      <div className="flex items-center gap-2">
        <kbd className="rounded border px-2 py-1">
          <CornerDownLeft className="h-3 w-3" />
        </kbd>
        Open
      </div>
    </div>
  );
}
