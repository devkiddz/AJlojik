'use client';

import { useEffect } from 'react';

type Props = {
  open: boolean;
  total: number;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  onSelect: () => void;
  onClose: () => void;
  desktopOnly?: boolean;
};

export default function SearchKeyboard({
  open,
  total,
  activeIndex,
  setActiveIndex,
  onSelect,
  onClose,
  desktopOnly = false
}: Props) {
  useEffect(() => {
    if (!open || (desktopOnly && window.innerWidth < 1024)) return;

    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          // Safely bound down to the last item in the suggestion array
          setActiveIndex(Math.min(activeIndex + 1, total - 1));
          break;

        case 'ArrowUp':
          e.preventDefault();
          // 🚀 THE FIX: Subtract 1 from the active index, but floor it at 0
          setActiveIndex(Math.max(0, activeIndex - 1));
          break;

        case 'Enter':
          if (activeIndex >= 0 && total > 0) {
            e.preventDefault();
            onSelect();
          }
          break;

        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, activeIndex, total, setActiveIndex, onSelect, onClose, desktopOnly]);

  return null;
}
