'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from './ui/button';
import UserActionComponent from './UserActionComponent';
import { useSearchParams } from 'next/navigation';
import { categories } from '@/categories';
import { Menu, ChevronRight, X } from 'lucide-react'; // Added X for the close button

type CategoryPanelProps = {
  activeSlug: string;
};

export default function CategoryPanel({ activeSlug }: CategoryPanelProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState<(typeof categories)[number] | null>(null);

  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category') ?? 'featured';

  const activeIndex = categories.findIndex(c => c.slug === selectedCategory && activeSlug);

  const ITEM_HEIGHT = 53;

  return (
    <motion.div
      // UPDATED: Dynamically defaults width animation down to 45px on mobile screens, 70px on desktop frames
      animate={{
        width: collapsed ? (typeof window !== 'undefined' && window.innerWidth < 768 ? 45 : 70) : 200
      }}
      transition={{ type: 'spring', stiffness: 250, damping: 25 }}
      onMouseLeave={() => setHoveredCategory(null)}
      className="relative flex flex-col gap-2 p-2 md:p-3 bg-primary-foreground/80 backdrop-blur-xs shadow-lg h-fit max-h-[calc(100vh-2rem)] border border-white/5 rounded-2xl">
      {/* toggle */}
      <Button
        onClick={() => setCollapsed(p => !p)}
        className="flex items-center justify-center p-2 rounded-lg bg-rose-500/70 ring-1 hover:bg-rose-500 ring-rose-500">
        <Menu className="w-5 h-5" />
      </Button>

      {/* indicator (FIXED PIXEL POSITION) */}
      <motion.div
        className="absolute left-0 w-1 bg-rose-500 rounded-full"
        animate={{
          top: activeIndex >= 0 ? activeIndex * ITEM_HEIGHT : 0,
          height: ITEM_HEIGHT
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />

      {/* items */}
      <div className="flex flex-col gap-1 overflow-y-auto no-scrollbar">
        {categories.map(cat => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.slug;
          const isHovered = hoveredCategory?.id === cat.id;

          return (
            <div key={cat.id} onMouseEnter={() => setHoveredCategory(cat)} className="relative group">
              <Link href={`/?category=${cat.slug}`}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors
                    ${isActive || isHovered ? 'text-rose-500 bg-rose-500/10 font-semibold' : 'text-muted-foreground'}
                  `}>
                  <div className="flex items-center gap-3">
                    {Icon && (
                      <Icon
                        className={`w-4 h-4 lg:w-5 lg:h-5 shrink-0 ${isActive || isHovered ? 'text-rose-500' : ''}`}
                      />
                    )}
                    {!collapsed && <span className="text-sm">{cat.label}</span>}
                  </div>

                  {!collapsed && cat.subcategories && cat.subcategories.length > 0 && (
                    <ChevronRight
                      className={`w-4 h-4 opacity-40 transition-transform ${isHovered ? 'translate-x-0.5 opacity-100 text-rose-500' : ''}`}
                    />
                  )}
                </motion.div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* account */}
      <div className="mt-auto flex items-center gap-3 pt-2 border-t border-white/5">
        <UserActionComponent />
        {!collapsed && <span className="text-sm">Account</span>}
      </div>

      {/* AMAZON-STYLE SUB-CATEGORIES FLYOUT PANEL */}
      <AnimatePresence>
        {hoveredCategory && hoveredCategory.subcategories && hoveredCategory.subcategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            // UPDATED: Standardizes width to w-45 variant on mobile devices, keeping standard structural properties on desktop
            className="absolute top-0 left-[calc(100%+0.5rem)] h-full w-45 md:w-64 bg-background/95 backdrop-blur-md border border-border/50 shadow-2xl p-4 flex flex-col gap-3 z-50 border-l-2 border-l-rose-500">
            <div className="relative flex items-center justify-between pr-6 border-b border-b-rose-500 pb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 px-2 line-clamp-1">
                {hoveredCategory.label}
              </h3>

              {/* NEW: Explicit close toggle button setup for intuitive touch clearing */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  setHoveredCategory(null);
                }}
                className="absolute right-0 p-1 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                aria-label="Close subcategories">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1 overflow-y-auto no-scrollbar">
              {hoveredCategory.subcategories.map(sub => (
                <Link
                  key={sub.slug}
                  href={`/?category=${hoveredCategory.slug}&sub=${sub.slug}`}
                  onClick={() => setHoveredCategory(null)}
                  className="text-sm text-foreground/80 hover:text-rose-500 hover:bg-rose-500/5 px-2 py-2 rounded-md transition-all duration-150">
                  {sub.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
