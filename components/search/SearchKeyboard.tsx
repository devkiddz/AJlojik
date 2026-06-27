'use client';

import { useEffect } from 'react';

type Props = {
  open: boolean;
  total: number;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  onSelect: () => void;
  onClose: () => void;
};

export default function SearchKeyboard({
  open,
  total,
  activeIndex,
  setActiveIndex,
  onSelect,
  onClose
}: Props) {
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex(Math.min(activeIndex + 1, total - 1));
          break;

        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex(Math.max(activeIndex - 1, 0));
          break;

        case 'Enter':
          if (activeIndex >= 0) {
            e.preventDefault();
            onSelect();
          }
          break;

        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKey);

    return () => window.removeEventListener('keydown', handleKey);
  }, [open, activeIndex, total, setActiveIndex, onSelect, onClose]);

  return null;
}
