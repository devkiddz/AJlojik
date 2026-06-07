'use client';

import { ProductsType } from '@/types';
import { motion } from 'framer-motion';
import Image from 'next/image';
import RatingComponent from './RatingComponent';

type ProductCardProps = {
  products: ProductsType;
};

// const products = [
//   {
//     name: 'Red Wine',
//     price: '$12',
//     tag: 'Vine',
//     description: 'You may add neccessary descriptions, but keep it little. A bottle of fine red wine.'
//   },
//   { name: 'BBQ Chicken', price: '$8', tag: 'Kitchen', description: 'Juicy grilled chicken with BBQ sauce.' },
//   { name: 'Whiskey', price: '$25', tag: 'Liqz', description: 'Premium whiskey with a smooth finish.' },
//   { name: 'Spices Pack', price: '$5', tag: 'Kitchen', description: 'A collection of premium spices.' },
//   { name: 'Champagne', price: '$18', tag: 'Liqz', description: 'Effervescent champagne for celebrations.' },
//   { name: 'Brandy', price: '$28', tag: 'Liqz', description: 'Rich and complex brandy with a hint of oak.' }
// ];

export default function ProductCard({ products }: ProductCardProps) {
  return (
    <>
      {products.map((item, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.05, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="rounded-xl border bg-background p-4 shadow-sm">
          <div className="relative h-60 bg-muted rounded-lg mb-3">
            <Image src={item.images} alt={item.name} fill className="object-cover object-bottom" />
          </div>
          <div>
            <h3 className="font-semibold text-md p-2 rounded-full inset shadow-inner">{item.name}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.shortDescription}</p>
          </div>
          <div>
            <RatingComponent rating={item.rating} reviews={item.reviews} />
          </div>
          <div className="mt-2 font-bold text-rose-500">{item.price}</div>
        </motion.div>
      ))}
    </>
  );
}
