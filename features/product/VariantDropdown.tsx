'use client';

import { useState } from 'react';
import { ProductVariantType } from '@/types/types';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  variants: ProductVariantType[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function VariantDropdown({ variants, selectedId, onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = variants.find(v => v.id === selectedId) || variants[0];

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-background border border-border rounded-xl px-4 py-3 text-xs font-bold text-foreground hover:border-accent/50 transition-all outline-none">
        {selected.label}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 w-full mt-2 bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
            {variants.map(v => (
              <button
                key={v.id}
                onClick={() => {
                  onSelect(v.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold hover:bg-accent/5 transition-colors ${
                  selectedId === v.id ? 'text-accent' : 'text-foreground'
                }`}>
                {v.label}
                {selectedId === v.id && <Check className="h-4 w-4" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
