'use client';

import { motion } from 'framer-motion';

const products = [
  { name: 'Red Wine', price: '$12', tag: 'Liquors' },
  { name: 'BBQ Chicken', price: '$8', tag: 'Kitchen' },
  { name: 'Whiskey', price: '$25', tag: 'Liquors' },
  { name: 'Spices Pack', price: '$5', tag: 'Kitchen' },
  { name: 'Champagne', price: '$18', tag: 'Liquors' },
  { name: 'Brandy', price: '$28', tag: 'Liquors' }
];

export default function ProductGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((item, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.05, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="rounded-xl border bg-background p-4 shadow-sm">
          <div className="h-24 bg-muted rounded-lg mb-3" />

          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-sm text-muted-foreground">{item.tag}</p>

          <div className="mt-2 font-bold text-rose-500">{item.price}</div>
        </motion.div>
      ))}
    </div>
  );
}
