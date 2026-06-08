'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from './ui/button';
import UserActionComponent from './UserActionComponent';
import { useSearchParams } from 'next/navigation';
import { categories } from '@/categories';
import { Menu, ChevronRight, X } from 'lucide-react';

type CategoryPanelProps = {
  activeSlug: string;
};

export default function CategoryPanel({ activeSlug }: CategoryPanelProps) {
  // Default to true (hidden/collapsed) on mount
  const [collapsed, setCollapsed] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState<(typeof categories)[number] | null>(null);

  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category') ?? 'featured';

  const activeIndex = categories.findIndex(c => c.slug === selectedCategory && activeSlug);
  const ITEM_HEIGHT = 53;

  return (
    <>
      {/* 1. FIXED HAMBURGER BUTTON (Always visible when panel is closed) */}
      {collapsed && (
        <div className="fixed top-26 left-3 z-40">
          <Button
            onClick={() => setCollapsed(false)}
            className="flex items-center justify-center p-2 rounded-lg bg-rose-500/70 ring-1 hover:bg-rose-500 ring-rose-500">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* 2. OVERLAY BACKDROP (Closes drawer when clicking outside on mobile) */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setCollapsed(true);
              setHoveredCategory(null);
            }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40"
          />
        )}
      </AnimatePresence>

      {/* 3. SLIDE-OUT CATEGORY DRAWER */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onMouseLeave={() => setHoveredCategory(null)}
            className="fixed top-0 left-0 h-screen w-64 bg-primary-foreground/95 backdrop-blur-md shadow-2xl p-4 flex flex-col gap-2 z-50 border-r border-border/20">
            {/* Top Row: Brand Header & Close Button */}
            <div className="flex items-center justify-between pb-2 border-b border-border/40 mb-2">
              <span className="font-bold text-rose-500 text-sm tracking-wide">Categories</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setCollapsed(true);
                  setHoveredCategory(null);
                }}
                className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Active Indicator Line */}
            <motion.div
              className="absolute left-0 w-1 bg-rose-500 rounded-full"
              style={{ top: 68 }} // Offset below the header row
              animate={{
                top: activeIndex >= 0 ? 68 + activeIndex * ITEM_HEIGHT : 68,
                height: ITEM_HEIGHT
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />

            {/* Category Items */}
            <div className="flex flex-col gap-1">
              {categories.map(cat => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.slug;
                const isHovered = hoveredCategory?.id === cat.id;

                return (
                  <div key={cat.id} onMouseEnter={() => setHoveredCategory(cat)} className="relative group">
                    <Link
                      href={`/?category=${cat.slug}`}
                      onClick={() => {
                        // If it doesn't have subcategories, close the whole menu on click
                        if (!cat.subcategories || cat.subcategories.length === 0) {
                          setCollapsed(true);
                        }
                      }}>
                      <motion.div
                        whileHover={{ x: 4 }}
                        className={`flex items-center justify-between p-2 h-[45px] rounded-lg transition-colors cursor-pointer
                          ${isActive || isHovered ? 'text-rose-500 bg-rose-500/10 font-semibold' : 'text-muted-foreground'}
                        `}>
                        <div className="flex items-center gap-3">
                          {Icon && (
                            <Icon
                              className={`w-4 h-4 lg:w-5 lg:h-5 shrink-0 ${isActive || isHovered ? 'text-rose-500' : ''}`}
                            />
                          )}
                          <span className="text-sm">{cat.label}</span>
                        </div>

                        {cat.subcategories && cat.subcategories.length > 0 && (
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

            {/* Account Info Footer */}
            <div className="mt-auto flex items-center gap-3 pt-4 border-t border-border/40">
              <UserActionComponent />
              <span className="text-sm font-medium text-muted-foreground">Account</span>
            </div>

            {/* ========================================================================= */}
            {/* NESTED AMAZON-STYLE SUB-CATEGORIES FLYOUT PANEL                           */}
            {/* ========================================================================= */}
            <AnimatePresence>
              {hoveredCategory &&
                hoveredCategory.subcategories &&
                hoveredCategory.subcategories.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute top-0 left-full h-full w-60 bg-background/98 backdrop-blur-md border-l border-border/50 shadow-2xl p-4 flex flex-col gap-3 z-50">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2">
                        {hoveredCategory.label}
                      </h3>
                    </div>
                    <hr className="border-border/40" />
                    <div className="flex flex-col gap-1 overflow-y-auto">
                      {hoveredCategory.subcategories.map(sub => (
                        <Link
                          key={sub.slug}
                          href={`/?category=${hoveredCategory.slug}&sub=${sub.slug}`}
                          onClick={() => {
                            setHoveredCategory(null);
                            setCollapsed(true); // Completely close everything on item choice
                          }}
                          className="text-xs text-foreground/80 hover:text-rose-500 hover:bg-rose-500/5 px-2 py-2.5 rounded-md transition-all duration-150">
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
