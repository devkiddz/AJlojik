'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from './ui/button';
import UserActionComponent from './UserActionComponent';
// import { useSearchParams } from 'next/navigation';
import { categories } from '@/categories';
import { Menu } from 'lucide-react';

// type categoriesProp = {
//   categories: CategoriesType;
// };

type CategoryPanelProps = {
  activeSlug: string;
};

// const categories = [
//   { id: 'featured', label: 'Featured', icon: Sparkles },
//   { id: 'deals', label: 'Deals', icon: Flame },
//   { id: 'liquors', label: 'Liquors', icon: Wine },
//   { id: 'kitchen', label: 'Kitchen', icon: Utensils }
// ];

export default function CategoryPanel({ activeSlug }: CategoryPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const activeIndex = categories.findIndex(c => c.slug === activeSlug);

  // const searchParams = useSearchParams();
  // const selectedCatebory = searchParams.get('category');

  return (
    <motion.div
      animate={{
        width: collapsed ? 70 : 150
      }}
      transition={{
        type: 'spring',
        stiffness: 250,
        damping: 25
      }}
      className="relative z-2 flex flex-col gap-2 p-3 bg-primary-foreground/80 backdrop-blur-xs shadow-lg">
      <Button
        variant="outline"
        onClick={() => setCollapsed(prev => !prev)}
        className="flex items-center justify-center p-2 rounded-lg hover:bg-muted">
        <Menu className="w-5 h-5" />
      </Button>

      <motion.div
        layout
        className="absolute left-0 w-1 bg-rose-500 rounded-full"
        style={{
          top: activeIndex,
          height: 40
        }}
      />

      {categories.map(cat => {
        const Icon = cat.icon;
        const isActive = activeSlug === cat.slug;

        return (
          <Link href={`/shop/${cat.slug}`} key={cat.id}>
            <motion.div
              whileHover={{ x: 4 }}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors
              ${isActive ? 'text-rose-500 bg-rose-500/10 font-semibold' : 'text-muted-foreground'}`}>
              <Icon className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
              {!collapsed && (
                <motion.span
                  className="text-xs md:text-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}>
                  {cat.label}
                </motion.span>
              )}
            </motion.div>
          </Link>
        );
      })}

      <motion.div className="flex items-center gap-3">
        <UserActionComponent />
        {!collapsed && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            Account
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  );
}
