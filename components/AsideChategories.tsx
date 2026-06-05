'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Wine, Utensils, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const items = [
  {
    label: 'Liquors',
    icon: Wine
  },
  {
    label: 'Kitchen Quickies',
    icon: Utensils
  },
  {
    label: 'Deals',
    icon: Flame
  }
];
export default function AsideCategories() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{
        width: collapsed ? 80 : 256
      }}
      transition={{
        duration: 0.25
      }}
      className={cn(
        'sticky top-0 h-screen border-r bg-background transition-all duration-300 rounded-md',
        collapsed ? 'w-20' : 'w-64'
      )}>
      <div className="flex items-center justify-between p-4">
        {!collapsed && <h2 className="font-semibold">Categories</h2>}

        <Button size="icon" variant="ghost" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>

      <nav className="space-y-1 p-2">
        {items.map(item => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              className="
        flex w-full items-center gap-3
        rounded-lg px-3 py-2
        hover:bg-muted
      ">
              <Icon className="h-5 w-5 shrink-0" />

              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}>
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>
    </motion.aside>
  );
}
