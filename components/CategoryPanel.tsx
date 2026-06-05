'use client';

import { motion } from 'framer-motion';
import { Wine, Utensils, Sparkles, Flame } from 'lucide-react';

const categories = [
  { id: 'featured', label: 'Featured', icon: Sparkles },
  { id: 'deals', label: 'Deals', icon: Flame },
  { id: 'liquors', label: 'Liquors', icon: Wine },
  { id: 'kitchen', label: 'Kitchen', icon: Utensils }
];

export default function CategoryPanel({ active }: { active: string }) {
  return (
    <div className="relative grow flex flex-col gap-1 xl:p-3 bg-primary-foreground/80 backdrop-blur-xs shadow-lg">
      {/* ACTIVE INDICATOR BAR */}
      <motion.div
        layout
        className="absolute left-0 w-1 bg-rose-500 rounded-full"
        style={{
          top: categories.findIndex(c => c.id === active) * 40,
          height: 32
        }}
        transition={{ type: 'spring', stiffness: 300 }}
      />

      {categories.map(cat => {
        const Icon = cat.icon;
        const isActive = active === cat.id;

        return (
          <motion.div
            key={cat.id}
            whileHover={{ x: 4 }}
            className={`flex flex-col items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer
              ${isActive ? 'text-rose-500 font-semibold' : 'text-muted-foreground'}
            `}>
            <Icon className="w-8 h-8 font-light" />
            <span className="taegory-names hidden md:block">{cat.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
