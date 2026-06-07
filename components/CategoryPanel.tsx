'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Wine, Utensils, Sparkles, Flame } from 'lucide-react';
import { Button } from './ui/button';
import UserActionComponent from './UserActionComponent';

const categories = [
  { id: 'featured', label: 'Featured', icon: Sparkles },
  { id: 'deals', label: 'Deals', icon: Flame },
  { id: 'liquors', label: 'Liquors', icon: Wine },
  { id: 'kitchen', label: 'Kitchen', icon: Utensils }
];

export default function CategoryPanel({ active }: { active: string }) {
  const [collapsed, setCollapsed] = useState(true);

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
      className="relative flex flex-col gap-2 p-3 bg-primary-foreground/80 backdrop-blur-xs shadow-lg">
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
          top: categories.findIndex(c => c.id === active) * 56 + 52,
          height: 40
        }}
      />

      {categories.map(cat => {
        const Icon = cat.icon;
        const isActive = active === cat.id;

        return (
          <motion.div
            key={cat.id}
            whileHover={{ x: 4 }}
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer
            ${isActive ? 'text-rose-500 font-semibold' : 'text-muted-foreground'}`}>
            <Icon className="w-5 h-5 shrink-0" />

            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {cat.label}
              </motion.span>
            )}
          </motion.div>
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
