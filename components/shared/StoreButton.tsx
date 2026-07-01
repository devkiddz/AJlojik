'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Landmark } from 'lucide-react';

interface StoreButtonProps {
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function StoreButton({ active = false, onClick, className }: StoreButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        `
        group
        relative
        h-10
        overflow-hidden
        rounded-full
        border
        border-orange-400/30
        bg-transparent
        px-5
        font-semibold
        transition-all
        duration-300
        hover:scale-[1.02]
      `,
        className
      )}>
      {/* Animated Gradient */}
      <div
        className={cn(
          `
          absolute
          inset-0
          bg-[linear-gradient(120deg,#fd8c3a,#ffb65a,#fd8c3a)]
          bg-[length:300%_300%]
          animate-store-gradient
          transition-opacity
          duration-500
          `,
          active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
        )}
      />

      {/* Shine */}
      <div className="absolute inset-0 overflow-hidden rounded-full">
        <div
          className="
          absolute
          left-[-50%]
          top-0
          h-full
          w-1/4
          skew-x-[-20deg]
          bg-white/30
          blur-lg
          animate-store-shine
        "
        />
      </div>

      {/* Glow */}
      <div className="absolute inset-0 rounded-full shadow-[0_0_25px_rgba(253,140,58,.25)]" />

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2 text-white">
        <Landmark className="h-4 w-4 animate-store-float" />
        AJ Store
      </span>
    </Button>
  );
}
