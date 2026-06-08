'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from './ui/button';
import UserActionComponent from './UserActionComponent';
import { useSearchParams } from 'next/navigation';
import { categories } from '@/categories';
import { Menu } from 'lucide-react';

type CategoryPanelProps = {
  activeSlug: string;
};

export default function CategoryPanel({ activeSlug }: CategoryPanelProps) {
  const [collapsed, setCollapsed] = useState(true);

  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category') ?? 'featured';

  const activeIndex = categories.findIndex(c => c.slug === selectedCategory && activeSlug);

  const ITEM_HEIGHT = 53;

  return (
    <motion.div
      animate={{ width: collapsed ? 70 : 200 }}
      transition={{ type: 'spring', stiffness: 250, damping: 25 }}
      className="relative flex flex-col gap-2 p-3 bg-primary-foreground/80 backdrop-blur-xs shadow-lg">
      {/* toggle */}
      <Button
        onClick={() => setCollapsed(p => !p)}
        className="flex items-center justify-center p-2 rounded-lg bg-rose-500/70 ring-1 hover:bg-rose-500 ring-rose-500">
        <Menu className="w-5 h-5 " />
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
      {categories.map(cat => {
        const Icon = cat.icon;
        const isActive = selectedCategory === cat.slug;

        return (
          <Link href={`/?category=${cat.slug}`} key={cat.id}>
            <motion.div
              whileHover={{ x: 4 }}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors
                ${isActive ? 'text-rose-500 bg-rose-500/10 font-semibold' : 'text-muted-foreground'}
              `}>
              {Icon && (
                <Icon className={`w-4 h-4 lg:w-5 lg:h-5 shrink-0 ${isActive ? 'text-rose-500' : ''}`} />
              )}

              {!collapsed && <motion.span className="text-sm">{cat.label}</motion.span>}
            </motion.div>
          </Link>
        );
      })}

      {/* account */}
      <div className="mt-auto flex items-center gap-3">
        <UserActionComponent />
        {!collapsed && <span>Account</span>}
      </div>
    </motion.div>
  );
}
