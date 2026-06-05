'use client';

import { motion } from 'framer-motion';

const cards = [
  {
    title: 'Liquors Collection',
    desc: 'Premium wines, whiskey & cocktails',
    color: 'from-rose-500/20 to-rose-500/5'
  },
  {
    title: 'Kitchen Quickies',
    desc: 'Fast meals & BBQ essentials',
    color: 'from-orange-500/20 to-orange-500/5'
  }
];

export default function SideCards() {
  return (
    <div className="flex flex-col gap-4 p-2">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.03 }}
          className={`rounded-xl p-4 border bg-linear-to-br ${card.color}`}>
          <h3 className="font-semibold">{card.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}
